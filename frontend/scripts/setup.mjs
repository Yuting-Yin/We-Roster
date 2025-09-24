// scripts/setup.mjs
import { execSync } from "node:child_process";
import {
  existsSync,
  copyFileSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";

const RESET = process.argv.includes("--reset");

const log = (msg) => console.log(`\x1b[36m[setup]\x1b[0m ${msg}`);
const warn = (msg) => console.warn(`\x1b[33m[warn]\x1b[0m ${msg}`);
const fail = (msg) => {
  console.error(`\x1b[31m[error]\x1b[0m ${msg}`);
  process.exit(1);
};

function run(cmd, opts = {}) {
  log(`$ ${cmd}`);
  execSync(cmd, { stdio: "inherit", ...opts });
}

function getVersion(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

/* ---------- Checks ---------- */
function ensureNode() {
  const v = getVersion("node -v");
  if (!v) fail("Node.js not installed. Please install Node 18/20/22 LTS.");
  const major = Number(v.replace(/^v/, "").split(".")[0]);
  if (major < 18) fail(`Node >= 18 required. Current: ${v}`);
  log(`Detected Node ${v}`);
}

function ensureNpm() {
  const v = getVersion("npm -v");
  if (!v) fail("npm not found. Please install Node.js with npm included.");
  log(`Detected npm ${v}`);
}

function maybeWarnWindowsExecPolicy() {
  if (process.platform === "win32") {
    warn(
      "If you hit PowerShell execution policy issues, run (as admin):\n" +
        "  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force"
    );
  }
}

function ensureExpoCLI() {
  const v = getVersion("npx expo --version");
  if (!v) fail("Expo CLI not available via npx. Check your npm installation.");
  log(`Detected Expo CLI ${v}`);
}

/* ---------- Install ---------- */
function cleanIfRequested() {
  if (!RESET) return;
  log("Reset mode: removing node_modules and package-lock.json …");
  try { rmSync("node_modules", { recursive: true, force: true }); } catch {}
  try { rmSync("package-lock.json", { force: true }); } catch {}
}

function installDeps() {
  const hasPackageLock = existsSync("package-lock.json");
  try {
    run(hasPackageLock ? "npm ci" : "npm install");
  } catch {
    warn("npm ci/install failed. Retrying with --legacy-peer-deps …");
    try {
      run("npm install --legacy-peer-deps");
    } catch {
      fail("Dependency installation failed.");
    }
  }
}

function getPkg() {
  return JSON.parse(readFileSync("package.json", "utf8"));
}

function ensureExpoModules() {
  // Add more common Expo modules here if you want them auto-installed.
  const required = ["expo-clipboard"];

  const pkg = getPkg();
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const missing = required.filter((name) => !deps[name]);

  if (missing.length === 0) {
    log("Expo modules already present (e.g. expo-clipboard).");
    return;
  }
  log(`Missing Expo modules: ${missing.join(", ")}. Installing…`);
  run(`npx expo install ${missing.join(" ")}`);
}

/* ---------- Config files ---------- */
function ensureEnvFiles() {
  const example = ".env.example";
  const target = ".env";
  if (!existsSync(example)) {
    writeFileSync(
      example,
      [
        "# Example environment file",
        "EXPO_PUBLIC_API_BASE=https://api.example.com",
        "EXPO_PUBLIC_ENV=dev",
        "",
      ].join("\n"),
      "utf8"
    );
    log("Generated .env.example");
  }
  if (!existsSync(target)) {
    copyFileSync(example, target);
    log("Created .env from .env.example (please update values).");
  } else {
    log(".env already exists, skipped.");
  }
}

function writeNvmrcIfMissing() {
  const nvmrc = ".nvmrc";
  if (!existsSync(nvmrc)) {
    const nodeV = getVersion("node -v") || "v20";
    writeFileSync(nvmrc, nodeV + "\n", "utf8");
    log(`Wrote ${nvmrc} (${nodeV}).`);
  }
}

function ensureTsconfig() {
  const target = "tsconfig.json";
  const desired = {
    extends: "expo/tsconfig.base",
    compilerOptions: {
      target: "ES2020",
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      jsx: "react-jsx",
      moduleResolution: "Bundler",
      types: ["node", "react"],
      allowJs: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
    },
    include: ["src", "App.tsx", "App.ts", "index.ts", "index.tsx"],
    exclude: ["node_modules", "babel.config.js"],
  };

  if (!existsSync(target)) {
    writeFileSync(target, JSON.stringify(desired, null, 2) + "\n", "utf8");
    log("Generated tsconfig.json for Expo + React Native.");
  } else {
    try {
      const content = JSON.parse(readFileSync(target, "utf8"));
      if (!content.extends || content.extends !== "expo/tsconfig.base") {
        writeFileSync(target, JSON.stringify(desired, null, 2) + "\n", "utf8");
        warn("Rewrote tsconfig.json to a known-good Expo preset.");
      } else {
        log("tsconfig.json present. Skipped overwrite.");
      }
    } catch {
      writeFileSync(target, JSON.stringify(desired, null, 2) + "\n", "utf8");
      warn("tsconfig.json was invalid. Rewrote with Expo preset.");
    }
  }
}

/* ---- TS path aliases (@/* -> src/*) ---- */
function ensureTsconfigPaths() {
  const file = "tsconfig.json";
  let obj;
  try {
    obj = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return; // ensureTsconfig will create it
  }

  let changed = false;
  obj.compilerOptions ??= {};
  if (obj.compilerOptions.baseUrl !== ".") {
    obj.compilerOptions.baseUrl = ".";
    changed = true;
  }
  const paths = obj.compilerOptions.paths ?? {};
  if (!paths["@/*"] || paths["@/*"][0] !== "src/*") {
    paths["@/*"] = ["src/*"];
    obj.compilerOptions.paths = paths;
    changed = true;
  }

  if (changed) {
    writeFileSync(file, JSON.stringify(obj, null, 2) + "\n", "utf8");
    log("Patched tsconfig.json with baseUrl + paths for '@/'.");
  } else {
    log("tsconfig.json already has baseUrl + paths.");
  }
}

/* ---- Babel module-resolver for Metro runtime ---- */
function ensureBabelModuleResolver() {
  // 1) ensure devDep installed
  const pkg = getPkg();
  const all = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  if (!all["babel-plugin-module-resolver"]) {
    run("npm i -D babel-plugin-module-resolver");
  }

  // 2) patch babel.config.js
  const path = "babel.config.js";
  let content = existsSync(path)
    ? readFileSync(path, "utf8")
    : `module.exports = function (api) { api.cache(true); return { presets: ["babel-preset-expo"], plugins: [] }; };`;

  if (!content.includes("module-resolver")) {
    if (content.includes("plugins: [")) {
      content = content.replace(
        /plugins:\s*\[/,
        `plugins: [
      ["module-resolver", {
        root: ["."],
        alias: { "@": "./src" },
        extensions: [".tsx", ".ts", ".js", ".jsx", ".json"]
      }],`
      );
    } else if (content.includes("return {")) {
      content = content.replace(
        /return\s*{([\s\S]*?)}/,
        (m, inner) =>
          `return { ${inner.trim().replace(/,+$/, "")}, plugins: [["module-resolver", { root: ["."], alias: { "@": "./src" }, extensions: [".tsx", ".ts", ".js", ".jsx", ".json"] }]] }`
      );
    } else {
      // fallback overwrite
      content = `module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["module-resolver", {
        root: ["."],
        alias: { "@": "./src" },
        extensions: [".tsx", ".ts", ".js", ".jsx", ".json"]
      }]
    ]
  };
};`;
    }
    writeFileSync(path, content, "utf8");
    log("Patched babel.config.js with module-resolver alias '@/'.");
  } else {
    log("babel.config.js already has module-resolver.");
  }
}

/* ---------- Diagnostics ---------- */
function expoDoctor() {
  try {
    run("npx expo doctor");
  } catch {
    warn("Expo doctor reported issues. Review its output for suggestions.");
  }
}

function androidHints() {
  if (process.platform === "win32" || process.platform === "linux") {
    const hasAdb = !!getVersion("adb version");
    if (!hasAdb) {
      warn(
        "ADB/Android SDK not found. Install Android Studio and configure ANDROID_HOME."
      );
    } else {
      log("Detected Android platform tools (adb).");
    }
  }
}

function iosHints() {
  if (process.platform === "darwin") {
    const xcodebuild = getVersion("xcodebuild -version");
    if (!xcodebuild) {
      warn("Xcode not found. Install from App Store for iOS builds.");
    } else {
      log(`Detected Xcode: ${xcodebuild.split("\n")[0]}`);
    }
  }
}

function finalTips() {
  log("Environment setup finished ✅");
  console.log(
    [
      "",
      "Next steps:",
      "  npm run start    # start Expo bundler",
      "  npm run android  # run on Android device/emulator",
      "  npm run ios      # run on iOS simulator (macOS + Xcode)",
      "  npm run web      # run in browser",
      "",
      "If dependency issues remain, run:",
      "  npm run setup -- --reset",
      "",
    ].join("\n")
  );
}

/* ---------- Main ---------- */
ensureNode();
ensureNpm();
maybeWarnWindowsExecPolicy();
ensureExpoCLI();
cleanIfRequested();
installDeps();
ensureExpoModules();
ensureEnvFiles();
ensureTsconfig();
ensureTsconfigPaths();       // add @/* alias to TS
ensureBabelModuleResolver(); // add @/* alias to Babel/Metro
writeNvmrcIfMissing();
expoDoctor();
androidHints();
iosHints();
finalTips();

export const fmt = (d: Date, opt: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", opt).format(d);

export const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export const hoursBetween = (s: string, e: string) => {
  const [sh, sm] = s.split(":").map(Number);
  const [eh, em] = e.split(":").map(Number);
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
};

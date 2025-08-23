package com.weroster.web;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/v1/las/auth")
public class AuthController {
  record LoginReq(String username, String password) {}
  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginReq req){
    // 演示用：任意非空即“成功”，真实项目改为数据库校验 + JWT
    if(req.username()==null || req.username().isBlank() || req.password()==null || req.password().isBlank()){
      return ResponseEntity.status(401).body(Map.of("message","invalid credentials"));
    }
    return ResponseEntity.ok(Map.of(
      "token","demo-token-"+req.username(),  // 真实项目换成JWT
      "user", Map.of("id",1,"username",req.username(),"display_name","Demo User")
    ));
  }
}

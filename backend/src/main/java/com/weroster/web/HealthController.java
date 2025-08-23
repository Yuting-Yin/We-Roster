package com.weroster.web;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/v1")
public class HealthController {
  @GetMapping("/health-check")
  public Map<String,Object> health() { return Map.of("status","UP"); }
}

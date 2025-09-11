// com/weroster/health/HealthController.java
package main.com.weroster.controller;

import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HealthController {
    @GetMapping("/health")
    public Map<String,String> health() { return Collections.singletonMap("status", "UP"); }
}

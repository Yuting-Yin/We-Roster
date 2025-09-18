// src/main/com/weroster/dto/SubmissionResponse.java
package main.com.weroster.Dto;

import java.util.Map;

public class SubmissionResponse {
    public String result;   // "success" | "error"
    public String code;     // "PENDING" | "DUPLICATE_REQUEST" | "VALIDATION_ERROR" | "SESSION_EXPIRED"
    public String message;  // 用户可读提示
    public Map<String,Object> data;

    public static SubmissionResponse okPending(Map<String,Object> data){
        var r = new SubmissionResponse();
        r.result = "success";
        r.code = "PENDING";
        r.message = "Submission accepted and pending approval.";
        r.data = data;
        return r;
    }
    public static SubmissionResponse err(String code, String msg){
        var r = new SubmissionResponse();
        r.result = "error";
        r.code = code;
        r.message = msg;
        return r;
    }
}

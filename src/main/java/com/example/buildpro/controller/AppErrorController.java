package com.example.buildpro.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;

@RestController
public class AppErrorController implements ErrorController {

    @RequestMapping("/error")
    public Map<String, Object> handleError(HttpServletRequest request, HttpServletResponse response) {
        int status = response.getStatus();
        return Map.of(
            "status", status,
            "error", "An error occurred",
            "message", "The requested path caused an error with status code " + status
        );
    }
}

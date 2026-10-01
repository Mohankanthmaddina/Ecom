package com.example.buildpro.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FaviconController {

    @GetMapping("/favicon.ico")
    public ResponseEntity<Void> favicon() {
        // Return 200 OK instead of 204 NO_CONTENT to avoid confusing terminal logs
        return ResponseEntity.ok().build();
    }
}

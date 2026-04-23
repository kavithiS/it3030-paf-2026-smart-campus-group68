package com.sliit.paf.controller;

import com.sliit.paf.dto.MessageResponse;
import com.sliit.paf.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getOverview() {
        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("message", new MessageResponse("Admin access granted."));
        overview.put("totalUsers", userRepository.count());
        overview.put("status", "ADMIN_PANEL_READY");
        return overview;
    }
}
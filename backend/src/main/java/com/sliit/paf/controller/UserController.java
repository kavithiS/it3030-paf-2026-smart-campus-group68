package com.sliit.paf.controller;

import com.sliit.paf.dto.MessageResponse;
import com.sliit.paf.model.Role;
import com.sliit.paf.model.User;
import com.sliit.paf.repository.UserRepository;
import com.sliit.paf.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<com.sliit.paf.dto.UserProfileResponse> getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<User> userOptional = userRepository.findById(userDetails.getId());
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            return ResponseEntity.ok(new com.sliit.paf.dto.UserProfileResponse(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getProvider(),
                    user.getRoles(),
                    user.getCreatedAt()));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> updateUserRole(@PathVariable String id, @RequestBody Map<String, String> request) {
        String roleStr = request.get("role");
        if (roleStr == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Role is required"));
        }

        try {
            Role role = Role.valueOf(roleStr.toUpperCase());
            Optional<User> userOptional = userRepository.findById(id);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                // We keep it as a list of roles based on model, but we can replace entirely or add
                user.setRoles(List.of(role));
                userRepository.save(user);
                return ResponseEntity.ok(new MessageResponse("Role updated successfully!"));
            }
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid role"));
        }
    }
}

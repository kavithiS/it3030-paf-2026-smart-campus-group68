package com.sliit.paf.service;

import com.sliit.paf.dto.JwtResponse;
import com.sliit.paf.dto.LoginRequest;
import com.sliit.paf.dto.RegisterRequest;
import com.sliit.paf.model.Provider;
import com.sliit.paf.model.Role;
import com.sliit.paf.model.User;
import com.sliit.paf.repository.UserRepository;
import com.sliit.paf.security.JwtUtils;
import com.sliit.paf.security.UserDetailsImpl;
import com.sliit.paf.util.RoleEmailValidator;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;

    private final UserRepository userRepository;

    private final PasswordEncoder encoder;

    private final JwtUtils jwtUtils;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       PasswordEncoder encoder,
                       JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = jwtUtils.getRoleNames(userDetails.getAuthorities());

        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getEmail(),
                roles);
    }

    public void registerUser(RegisterRequest signUpRequest) {
        if (Boolean.TRUE.equals(userRepository.existsByEmail(signUpRequest.getEmail()))) {
            throw new DuplicateEmailException("Error: Email is already in use!");
        }

        String requestedRole = signUpRequest.getRole() == null
                ? "USER"
                : signUpRequest.getRole().trim().toUpperCase();

        Role role;
        try {
            role = Role.valueOf(requestedRole);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid role. Allowed roles: USER, ADMIN, TECHNICIAN.");
        }

        RoleEmailValidator.validateRoleEmail(role, signUpRequest.getEmail());

        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setProvider(Provider.LOCAL);
        user.setRoles(List.of(role));
        user.setCreatedAt(new Date());

        userRepository.save(user);
    }

    private Role resolvePrimaryRole(List<Role> roles) {
        if (roles == null || roles.isEmpty()) {
            return Role.USER;
        }

        return roles.get(0);
    }
}

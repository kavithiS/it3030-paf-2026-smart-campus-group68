package com.sliit.paf.util;

import com.sliit.paf.model.Role;

import java.util.regex.Pattern;

public final class RoleEmailValidator {

    private static final Pattern ADMIN_PATTERN = Pattern.compile("(?i)^admin.*@urh\\.com$");
    private static final Pattern TECHNICIAN_PATTERN = Pattern.compile("(?i)^tech.*@urh\\.com$");
    private static final Pattern USER_FORBIDDEN_PREFIX_PATTERN = Pattern.compile("(?i)^(admin|tech).*");
    private static final Pattern USER_FORBIDDEN_DOMAIN_PATTERN = Pattern.compile("(?i)^.*@urh\\.com$");

    private RoleEmailValidator() {
    }

    public static void validateRoleEmail(Role role, String email) {
        if (role == null || email == null) {
            throw new IllegalArgumentException("Role and email are required.");
        }

        if (!isValidForRole(role, email)) {
            throw new IllegalArgumentException(getErrorMessage(role));
        }
    }

    public static boolean isValidForRole(Role role, String email) {
        if (role == null || email == null) {
            return false;
        }

        String normalizedEmail = email.trim();

        return switch (role) {
            case ADMIN -> ADMIN_PATTERN.matcher(normalizedEmail).matches();
            case TECHNICIAN -> TECHNICIAN_PATTERN.matcher(normalizedEmail).matches();
            case USER -> !USER_FORBIDDEN_PREFIX_PATTERN.matcher(normalizedEmail).matches()
                    && !USER_FORBIDDEN_DOMAIN_PATTERN.matcher(normalizedEmail).matches();
        };
    }

    public static String getErrorMessage(Role role) {
        if (role == Role.ADMIN) {
            return "Admin email must start with 'admin' and use @urh.com domain.";
        }

        if (role == Role.TECHNICIAN) {
            return "Technician email must start with 'tech' and use @urh.com domain.";
        }

        if (role == Role.USER) {
            return "Invalid email for USER role";
        }

        return "Invalid email for selected role.";
    }
}
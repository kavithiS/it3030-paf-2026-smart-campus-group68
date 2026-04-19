package com.sliit.paf.dto;

import com.sliit.paf.model.Provider;
import com.sliit.paf.model.Role;

import java.util.Date;
import java.util.List;

public class UserProfileResponse {
    private String id;
    private String name;
    private String email;
    private Provider provider;
    private List<Role> roles;
    private Date createdAt;

    public UserProfileResponse(String id, String name, String email, Provider provider, List<Role> roles, Date createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.provider = provider;
        this.roles = roles;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Provider getProvider() {
        return provider;
    }

    public void setProvider(Provider provider) {
        this.provider = provider;
    }

    public List<Role> getRoles() {
        return roles;
    }

    public void setRoles(List<Role> roles) {
        this.roles = roles;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
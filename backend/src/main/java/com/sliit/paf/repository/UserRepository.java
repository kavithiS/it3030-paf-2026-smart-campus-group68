package com.sliit.paf.repository;

import com.sliit.paf.model.User;
import com.sliit.paf.model.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Boolean existsByEmail(String email);
    List<User> findAllByRolesContaining(Role role);
}

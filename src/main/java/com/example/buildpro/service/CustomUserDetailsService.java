package com.example.buildpro.service;

import com.example.buildpro.model.User;
import com.example.buildpro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

        @Autowired
        private UserRepository userRepository;

        @Override
        public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found with email: " + email));

                return new org.springframework.security.core.userdetails.User(
                                user.getEmail(),
                                user.getPassword(),
                                java.util.Collections
                                                .singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                                                "ROLE_" + user.getRole().name())));
        }

        public UserDetails loadUserById(Long id) throws UsernameNotFoundException {
                User user = userRepository.findById(id)
                                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

                return new org.springframework.security.core.userdetails.User(
                                String.valueOf(user.getId()), // Use ID as username for Spring Security context
                                user.getPassword(),
                                java.util.Collections
                                                .singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                                                "ROLE_" + user.getRole().name())));
        }
}

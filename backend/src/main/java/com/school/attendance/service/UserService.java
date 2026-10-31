package com.school.attendance.service;

import com.school.attendance.dto.CreateUserRequest;
import com.school.attendance.dto.UserDto;
import com.school.attendance.entity.Role;
import com.school.attendance.entity.User;
import com.school.attendance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDto> getActiveTeachers() {
        return userRepository.findByRole(Role.ROLE_TEACHER).stream()
                .filter(User::isActive)
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("User with email " + email + " already exists");
        }

        User user = new User(email, request.getName().trim(), null, request.getRole());
        user = userRepository.save(user);
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        user.setActive(!user.isActive());
        user = userRepository.save(user);
        return UserDto.fromEntity(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        user.setActive(false);
        userRepository.save(user);
    }
}

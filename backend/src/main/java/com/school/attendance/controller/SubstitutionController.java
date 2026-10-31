package com.school.attendance.controller;

import com.school.attendance.dto.SubstitutionDto;
import com.school.attendance.dto.SubstitutionRequest;
import com.school.attendance.service.SubstitutionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/substitutions")
public class SubstitutionController {

    private final SubstitutionService substitutionService;

    public SubstitutionController(SubstitutionService substitutionService) {
        this.substitutionService = substitutionService;
    }

    /**
     * POST /api/substitutions
     * Admin-only: assign a substitute teacher for a classroom on a given date.
     * If one already exists for that class+date, it will be replaced (upsert).
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<SubstitutionDto> assign(@RequestBody SubstitutionRequest req) {
        SubstitutionDto dto = substitutionService.assignSubstitute(req);
        return ResponseEntity.ok(dto);
    }

    /**
     * GET /api/substitutions?classroomId=1&date=2026-10-31
     * Any authenticated user: retrieve the substitute for a classroom on a given date.
     */
    @GetMapping
    public ResponseEntity<SubstitutionDto> get(
            @RequestParam Long classroomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return substitutionService.getSubstitution(classroomId, date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * DELETE /api/substitutions?classroomId=1&date=2026-10-31
     * Admin-only: remove a substitute assignment.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping
    public ResponseEntity<Void> remove(
            @RequestParam Long classroomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        substitutionService.removeSubstitution(classroomId, date);
        return ResponseEntity.noContent().build();
    }
}

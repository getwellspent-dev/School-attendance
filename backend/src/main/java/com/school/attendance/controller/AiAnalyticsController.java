package com.school.attendance.controller;

import com.school.attendance.dto.AiInsightsDto;
import com.school.attendance.dto.SchoolDashboardStatsDto;
import com.school.attendance.service.AnalyticsService;
import com.school.attendance.service.GeminiAiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiAnalyticsController {

    private final GeminiAiService geminiAiService;
    private final AnalyticsService analyticsService;
    private final String geminiApiKey;

    public AiAnalyticsController(
            GeminiAiService geminiAiService,
            AnalyticsService analyticsService,
            @Value("${app.gemini.api-key:}") String geminiApiKey) {
        this.geminiAiService = geminiAiService;
        this.analyticsService = analyticsService;
        this.geminiApiKey = geminiApiKey;
    }

    @GetMapping("/insights")
    public ResponseEntity<AiInsightsDto> getAiInsights(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        SchoolDashboardStatsDto stats = analyticsService.getSchoolDashboardStats(date);
        AiInsightsDto insights = geminiAiService.generateInsights(stats);
        return ResponseEntity.ok(insights);
    }

    @GetMapping("/status")
    public ResponseEntity<?> getAiStatus() {
        boolean configured = StringUtils.hasText(geminiApiKey);
        return ResponseEntity.ok(Map.of(
                "geminiConfigured", configured,
                "provider", "Google Gemini AI",
                "docsUrl", "https://aistudio.google.com/"
        ));
    }
}

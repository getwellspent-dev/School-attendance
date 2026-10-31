package com.school.attendance.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.school.attendance.dto.AiInsightsDto;
import com.school.attendance.dto.SchoolDashboardStatsDto;
import com.school.attendance.dto.SchoolDashboardStatsDto.ClassPerformanceDto;
import com.school.attendance.dto.SchoolDashboardStatsDto.DefaulterStudentDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class GeminiAiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiService.class);

    private final String apiKey;
    private final String model;
    private final String baseUrl;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiAiService(
            @Value("${app.gemini.api-key:}") String apiKey,
            @Value("${app.gemini.model:gemini-1.5-flash}") String model,
            @Value("${app.gemini.url:https://generativelanguage.googleapis.com/v1beta/models}") String baseUrl) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = model != null ? model.trim() : "gemini-1.5-flash";
        this.baseUrl = baseUrl;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public AiInsightsDto generateInsights(SchoolDashboardStatsDto stats) {
        if (StringUtils.hasText(apiKey)) {
            try {
                return callGeminiApi(stats);
            } catch (Exception e) {
                log.warn("Gemini API call failed, falling back to intelligent rule-based analytics: {}", e.getMessage());
            }
        }
        return generateRuleBasedInsights(stats);
    }

    private AiInsightsDto callGeminiApi(SchoolDashboardStatsDto stats) throws Exception {
        String url = String.format("%s/%s:generateContent?key=%s", baseUrl, model, apiKey);

        // Build data summary for the prompt
        StringBuilder dataPrompt = new StringBuilder();
        dataPrompt.append("School Attendance Snapshot (Date: ").append(stats.getTodayDate()).append("):\n");
        dataPrompt.append("- Total Enrolled Students: ").append(stats.getTotalStudents()).append("\n");
        dataPrompt.append("- Total Active Classrooms: ").append(stats.getTotalClassrooms()).append("\n");
        dataPrompt.append("- Today Attendance Rate: ").append(stats.getTodayAttendanceRate()).append("% (Present: ")
                .append(stats.getTodayPresentCount()).append(", Absent: ").append(stats.getTodayAbsentCount())
                .append(", Late: ").append(stats.getTodayLateCount()).append(")\n");
        dataPrompt.append("- 7-Day School Average: ").append(stats.getWeekAttendanceRate()).append("%\n");
        dataPrompt.append("- 30-Day School Average: ").append(stats.getMonthAttendanceRate()).append("%\n\n");

        dataPrompt.append("Class Performance Breakdowns:\n");
        for (ClassPerformanceDto cp : stats.getClassPerformance()) {
            dataPrompt.append("  * ").append(cp.getClassName()).append(" (Teacher: ").append(cp.getTeacherName())
                    .append(") - Today: ").append(cp.getTodayRate()).append("%, Week: ").append(cp.getWeekRate())
                    .append("%, Month: ").append(cp.getMonthRate()).append("%\n");
        }

        dataPrompt.append("\nChronic Absenteeism / Defaulters (<75% attendance):\n");
        if (stats.getChronicDefaulters().isEmpty()) {
            dataPrompt.append("  * None detected! All students meet or exceed 75% attendance.\n");
        } else {
            for (DefaulterStudentDto d : stats.getChronicDefaulters()) {
                dataPrompt.append("  * ").append(d.getFullName()).append(" (Roll: ").append(d.getRollNumber())
                        .append(", Class: ").append(d.getClassName()).append(") - Attendance Rate: ")
                        .append(d.getAttendanceRate()).append("% (Missed ").append(d.getAbsentDays())
                        .append(" out of ").append(d.getTotalDays()).append(" days)\n");
            }
        }

        String prompt = "You are an AI Educational Data Scientist & Strategic School Attendance Advisor. " +
                "Analyze the provided school attendance data and generate actionable, crystal-clear insights for both School Management and Class Teachers. " +
                "Respond in valid JSON format only, matching this exact structure:\n" +
                "{\n" +
                "  \"title\": \"Executive School Attendance Intelligence Report\",\n" +
                "  \"executiveSummary\": \"2-3 sentence executive synopsis of overall school attendance status\",\n" +
                "  \"overallHealthScore\": 85.0,\n" +
                "  \"healthStatus\": \"EXCELLENT\" | \"GOOD\" | \"ATTENTION_NEEDED\" | \"CRITICAL\",\n" +
                "  \"highlights\": [\"3-4 bullet points highlighting key positive achievements or notable trends\"],\n" +
                "  \"chronicAbsenteeismAlerts\": [\"specific alerts identifying classes or students who need immediate intervention\"],\n" +
                "  \"managementActionItems\": [\"3-4 concrete strategic steps for principal/management\"],\n" +
                "  \"teacherActionItems\": [\"3-4 day-to-day practical instructions for class teachers to boost student presence\"]\n" +
                "}\n\n" +
                "Data:\n" + dataPrompt.toString();

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.3,
                        "responseMimeType", "application/json"
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                String responseText = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
                AiInsightsDto dto = objectMapper.readValue(responseText, AiInsightsDto.class);
                dto.setModelUsed("Google Gemini (" + model + ")");
                dto.setGeneratedAt(LocalDateTime.now());
                return dto;
            }
        }

        return generateRuleBasedInsights(stats);
    }

    public AiInsightsDto generateRuleBasedInsights(SchoolDashboardStatsDto stats) {
        AiInsightsDto dto = new AiInsightsDto();
        dto.setTitle("School Attendance Intelligence & Diagnostics");
        dto.setGeneratedAt(LocalDateTime.now());
        dto.setModelUsed(StringUtils.hasText(apiKey) ? "Gemini Hybrid Diagnostics" : "Deterministic Educational Analytics Engine (Add Gemini API Key for LLM Analysis)");

        double todayRate = stats.getTodayAttendanceRate();
        double monthRate = stats.getMonthAttendanceRate();
        dto.setOverallHealthScore(monthRate > 0 ? monthRate : todayRate);

        if (dto.getOverallHealthScore() >= 90.0) {
            dto.setHealthStatus("EXCELLENT");
            dto.setExecutiveSummary("The school demonstrates exceptional attendance vitality with a " +
                    String.format("%.1f", dto.getOverallHealthScore()) + "% engagement rate. Student presence and classroom consistency are currently performing above educational benchmarks.");
        } else if (dto.getOverallHealthScore() >= 80.0) {
            dto.setHealthStatus("GOOD");
            dto.setExecutiveSummary("Attendance maintains a solid baseline at " +
                    String.format("%.1f", dto.getOverallHealthScore()) + "%. A few targeted classrooms and recurring student absences represent high-leverage opportunities for improvement.");
        } else if (dto.getOverallHealthScore() >= 70.0) {
            dto.setHealthStatus("ATTENTION_NEEDED");
            dto.setExecutiveSummary("School attendance is currently at " +
                    String.format("%.1f", dto.getOverallHealthScore()) + "%, below the optimal 85% threshold. Proactive outreach to parents of chronically absent students is strongly recommended.");
        } else {
            dto.setHealthStatus("CRITICAL");
            dto.setExecutiveSummary("Critical attendance alert: School-wide attendance rate has dropped to " +
                    String.format("%.1f", dto.getOverallHealthScore()) + "%. Management should launch an immediate review and family engagement protocol.");
        }

        // Highlights
        List<String> highlights = new ArrayList<>();
        highlights.add("Total of " + stats.getTotalStudents() + " students tracked across " + stats.getTotalClassrooms() + " classrooms.");
        highlights.add("Today's school-wide presence: " + stats.getTodayPresentCount() + " students present, " + stats.getTodayAbsentCount() + " absent, " + stats.getTodayLateCount() + " marked late.");
        highlights.add("7-Day moving attendance average stands at " + String.format("%.1f", stats.getWeekAttendanceRate()) + "%.");

        // Find top performing class
        stats.getClassPerformance().stream()
                .max(Comparator.comparingDouble(ClassPerformanceDto::getMonthRate))
                .ifPresent(top -> highlights.add("Top-performing class: " + top.getClassName() + " leads with a " + top.getMonthRate() + "% monthly average."));
        dto.setHighlights(highlights);

        // Chronic Absenteeism Alerts
        List<String> alerts = new ArrayList<>();
        if (stats.getChronicDefaulters().isEmpty()) {
            alerts.add("Zero chronic defaulters detected under 75% threshold in the last 30 days.");
        } else {
            alerts.add("Identified " + stats.getChronicDefaulters().size() + " student(s) currently below the mandatory 75% attendance compliance.");
            for (DefaulterStudentDto d : stats.getChronicDefaulters()) {
                alerts.add(String.format("%s (Roll #%s, %s): %.1f%% attendance (%d absences). Parent contact: %s",
                        d.getFullName(), d.getRollNumber(), d.getClassName(), d.getAttendanceRate(), d.getAbsentDays(), d.getParentPhone()));
            }
        }
        dto.setChronicAbsenteeismAlerts(alerts);

        // Management Action Items
        List<String> mgmt = new ArrayList<>();
        mgmt.add("Schedule automated or SMS/phone notifications for parents of students with 3 or more consecutive unexcused absences.");
        mgmt.add("Recognize and reward classrooms maintaining >95% monthly attendance during morning assembly.");
        mgmt.add("Review Monday and Friday absence patterns to identify systemic scheduling or transportation hurdles.");
        if (!StringUtils.hasText(apiKey)) {
            mgmt.add("To unlock real-time Gemini Generative AI insights and parent communication drafts, add your Google AI Studio API key.");
        }
        dto.setManagementActionItems(mgmt);

        // Teacher Action Items
        List<String> teacher = new ArrayList<>();
        teacher.add("Complete morning roll call within the first 15 minutes of the school day for accurate live reporting.");
        teacher.add("Flag any student arriving 'Late' more than twice a week for quick counselor check-in.");
        teacher.add("Review individual student weekly trend cards before weekly parent-teacher touchpoints.");
        teacher.add("Log detailed absence reasons in the remarks field to distinguish medical from unexcused leave.");
        dto.setTeacherActionItems(teacher);

        return dto;
    }
}

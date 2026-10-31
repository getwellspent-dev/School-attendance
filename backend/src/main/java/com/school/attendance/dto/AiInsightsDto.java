package com.school.attendance.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class AiInsightsDto {
    private String title;
    private String executiveSummary;
    private double overallHealthScore; // e.g. 88.5
    private String healthStatus; // EXCELLENT, GOOD, ATTENTION_NEEDED, CRITICAL
    private List<String> highlights = new ArrayList<>();
    private List<String> chronicAbsenteeismAlerts = new ArrayList<>();
    private List<String> managementActionItems = new ArrayList<>();
    private List<String> teacherActionItems = new ArrayList<>();
    private String modelUsed;
    private LocalDateTime generatedAt = LocalDateTime.now();

    public AiInsightsDto() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getExecutiveSummary() { return executiveSummary; }
    public void setExecutiveSummary(String executiveSummary) { this.executiveSummary = executiveSummary; }
    public double getOverallHealthScore() { return overallHealthScore; }
    public void setOverallHealthScore(double overallHealthScore) { this.overallHealthScore = overallHealthScore; }
    public String getHealthStatus() { return healthStatus; }
    public void setHealthStatus(String healthStatus) { this.healthStatus = healthStatus; }
    public List<String> getHighlights() { return highlights; }
    public void setHighlights(List<String> highlights) { this.highlights = highlights; }
    public List<String> getChronicAbsenteeismAlerts() { return chronicAbsenteeismAlerts; }
    public void setChronicAbsenteeismAlerts(List<String> chronicAbsenteeismAlerts) { this.chronicAbsenteeismAlerts = chronicAbsenteeismAlerts; }
    public List<String> getManagementActionItems() { return managementActionItems; }
    public void setManagementActionItems(List<String> managementActionItems) { this.managementActionItems = managementActionItems; }
    public List<String> getTeacherActionItems() { return teacherActionItems; }
    public void setTeacherActionItems(List<String> teacherActionItems) { this.teacherActionItems = teacherActionItems; }
    public String getModelUsed() { return modelUsed; }
    public void setModelUsed(String modelUsed) { this.modelUsed = modelUsed; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}

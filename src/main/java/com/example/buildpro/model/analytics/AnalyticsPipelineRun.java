package com.example.buildpro.model.analytics;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "analytics_pipeline_runs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsPipelineRun {

    @Id
    @Column(name = "pipeline_name", nullable = false)
    private String pipelineName;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "records_processed")
    private Long recordsProcessed;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}

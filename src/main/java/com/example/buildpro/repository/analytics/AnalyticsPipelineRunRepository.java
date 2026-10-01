package com.example.buildpro.repository.analytics;

import com.example.buildpro.model.analytics.AnalyticsPipelineRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalyticsPipelineRunRepository extends JpaRepository<AnalyticsPipelineRun, Long> {

    List<AnalyticsPipelineRun> findByPipelineNameOrderByStartTimeDesc(String pipelineName);

    List<AnalyticsPipelineRun> findByStatus(String status);
}

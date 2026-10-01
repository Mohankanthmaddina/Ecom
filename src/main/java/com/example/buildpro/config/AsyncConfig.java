package com.example.buildpro.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * AsyncConfig — Thread Pool Configuration for MegaMart
 *
 * Defines dedicated thread pools for each async concern:
 *   - emailTaskExecutor   : SMTP email sending (non-blocking HTTP threads)
 *   - aiTaskExecutor      : Gemini AI external API calls
 *   - orderEventExecutor  : Post-order side effects (wallet, cashback)
 *   - analyticsExecutor   : Background analytics feed cache refresh
 *   - taskScheduler       : Multi-threaded @Scheduled task runner
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    // ─── 1. Email Thread Pool ─────────────────────────────────────────────────
    // Sends OTP and order confirmation emails off the HTTP request thread.
    // SMTP calls can block 1–5 seconds; this keeps Tomcat threads free.
    @Bean("emailTaskExecutor")
    public Executor emailTaskExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(5);     // Always-warm threads
        exec.setMaxPoolSize(20);     // Scale up during registration spikes
        exec.setQueueCapacity(500);  // Buffer 500 pending emails
        exec.setThreadNamePrefix("email-");
        // CallerRunsPolicy: if pool is saturated, calling thread sends the email
        // (graceful degradation — no email is ever silently dropped)
        exec.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        exec.initialize();
        return exec;
    }

    // ─── 2. Gemini AI Thread Pool ─────────────────────────────────────────────
    // Handles external HTTP calls to the Gemini API for the chat widget.
    // Each call can take 500ms–5s; isolating these prevents chat load from
    // starving order/checkout request threads.
    @Bean("aiTaskExecutor")
    public Executor aiTaskExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(10);    // 10 concurrent AI conversations
        exec.setMaxPoolSize(30);     // Burst to 30 during peak usage
        exec.setQueueCapacity(100);  // Small queue — stale AI replies are useless
        exec.setThreadNamePrefix("ai-chat-");
        exec.setRejectedExecutionHandler(new ThreadPoolExecutor.AbortPolicy());
        exec.initialize();
        return exec;
    }

    // ─── 3. Order Event Thread Pool ──────────────────────────────────────────
    // Processes post-order side effects asynchronously (wallet cashback, etc.)
    // so the checkout response is returned to the user immediately after DB save.
    @Bean("orderEventExecutor")
    public Executor orderEventExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(5);
        exec.setMaxPoolSize(15);
        exec.setQueueCapacity(200);
        exec.setThreadNamePrefix("order-event-");
        exec.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        exec.initialize();
        return exec;
    }

    // ─── 4. Analytics Thread Pool ────────────────────────────────────────────
    // Runs the background product feed cache refresh every 5 minutes.
    // Isolating this ensures a slow DB scan never delays an HTTP response.
    @Bean("analyticsExecutor")
    public Executor analyticsExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(2);
        exec.setMaxPoolSize(5);
        exec.setQueueCapacity(10);
        exec.setThreadNamePrefix("analytics-");
        exec.initialize();
        return exec;
    }

    // ─── 5. Multi-threaded Task Scheduler ────────────────────────────────────
    // Replaces Spring's default single-threaded scheduler.
    // Without this, a slow @Scheduled task (OTP cleanup, cache refresh) would
    // block ALL other @Scheduled tasks in the application.
    @Bean
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(5);
        scheduler.setThreadNamePrefix("scheduler-");
        scheduler.setErrorHandler(t -> System.err.println(
                "[Scheduler Error] " + t.getMessage()));
        scheduler.initialize();
        return scheduler;
    }
}

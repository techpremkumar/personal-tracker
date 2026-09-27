package com.personaltracker.personal_tracker;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TrackController {

    private final ChatClient chatClient;
    private final TrackerTools trackerTools;

    public TrackController(ChatClient.Builder builder, TrackerTools trackerTools) {
        this.chatClient = builder.build();
        this.trackerTools = trackerTools;
    }

    // Test endpoint
    @GetMapping("/hello")
    public String hello() {
        return "Hello Personal Tracker!";
    }

    // Today's summary
    @GetMapping("/summary")
    public String summary() {
        return trackerTools.getTodaySummary();
    }

    // AI tracker
    @PostMapping("/track")
    public String track(@RequestBody TrackRequest request) {

        String systemPrompt =
                "You are a Personal Tracker AI Assistant. " +
                "If the user reports study progress, use saveProgress. " +
                "If the user asks for study hours, use getStudyHoursThisWeek. " +
                "If the user reports an expense, use saveExpense. " +
                "If the user asks about recent expenses, use getRecentExpenses. " +
                "If the user asks to add a task, use saveTask. " +
                "If the user asks to see tasks, use getTasks. " +
                "If the user says a task is completed, use markTaskCompleted. " +
                "If the user asks for today's summary, use getTodaySummary. " +
                "For normal conversation, do not call a tool.";

        return chatClient
                .prompt()
                .system(systemPrompt)
                .user(request.getMessage())
                .tools(trackerTools)
                .call()
                .content();
    }
}
package com.trellotracker.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Card {
    private String id;
    private String title;
    private String description;
    private Integer order;
    private String priority;
    private String status;
    private List<String> tags = new ArrayList<>();
    private LocalDateTime dueDate;
    private List<TimeEntry> timeEntries = new ArrayList<>();
    private Long totalMinutesSpent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

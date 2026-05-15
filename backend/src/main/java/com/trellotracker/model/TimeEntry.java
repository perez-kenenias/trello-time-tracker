package com.trellotracker.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeEntry {
    private String id;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long minutes;
    private LocalDateTime createdAt;
}

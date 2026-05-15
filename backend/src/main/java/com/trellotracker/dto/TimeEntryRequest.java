package com.trellotracker.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeEntryRequest {
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}

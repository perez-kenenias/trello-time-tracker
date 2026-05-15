package com.trellotracker.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardRequest {
    private String title;
    private String description;
    private String priority;
    private String status;
    private List<String> tags;
    private LocalDateTime dueDate;
    private String listId;
}

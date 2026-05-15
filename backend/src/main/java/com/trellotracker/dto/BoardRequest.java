package com.trellotracker.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardRequest {
    private String title;
    private String description;
    private String templateType;
    private List<String> listTitles;
}

package com.trellotracker.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "boards")
public class Board {
    @Id
    private String id;
    private String title;
    private String description;
    private String templateType;
    private List<BoardList> lists = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

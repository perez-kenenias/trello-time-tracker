package com.trellotracker.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoveCardRequest {
    private String sourceListId;
    private String targetListId;
    private Integer newOrder;
}

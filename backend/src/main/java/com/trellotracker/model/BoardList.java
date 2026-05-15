package com.trellotracker.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardList {
    private String id;
    private String title;
    private Integer order;
    private List<Card> cards = new ArrayList<>();
}

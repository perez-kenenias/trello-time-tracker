package com.trellotracker.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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

    // Campos premium editables desde el detalle de tarjeta
    private String cover;                    // color de portada
    private String recurring;                // daily | weekly | monthly
    private Boolean done;                    // marca de completado
    private Map<String, String> labels;      // etiquetas con color
    private List<String> assignedMembers;    // miembros asignados
}

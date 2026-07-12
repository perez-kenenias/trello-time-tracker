package com.trellotracker.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Card model extendido con todas las features premium:
 * - labels (con color)
 * - members asignados
 * - checklist
 * - comments
 * - cover (color key)
 * - custom fields
 * - votes
 * - recurring
 * - done flag
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Card {
    private String id;
    private String title;
    private String description;
    private Integer order;

    // Core fields (ya existentes)
    private String priority;          // "high" | "medium" | "low" | null
    private String status;            // "active" | "done"
    private List<String> tags = new ArrayList<>();
    private LocalDateTime dueDate;
    private List<TimeEntry> timeEntries = new ArrayList<>();
    private Long totalMinutesSpent;

    // ── Nuevos campos premium ──────────────────────────────────────────────

    /** Etiquetas con color. Key = nombre, Value = color key (violet, rose, amber…) */
    @Builder.Default
    private Map<String, String> labels = new HashMap<>();

    /** IDs de miembros asignados */
    @Builder.Default
    private List<String> assignedMembers = new ArrayList<>();

    /** Lista de verificación */
    @Builder.Default
    private List<CheckItem> checklist = new ArrayList<>();

    /** Comentarios */
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    /** Color de portada (rose, amber, green, teal, blue, violet) */
    private String cover;

    /** Campos personalizados: nombre → valor */
    @Builder.Default
    private Map<String, String> customFields = new HashMap<>();

    /** Número de votos */
    @Builder.Default
    private Integer votes = 0;

    /** Recurrencia: null | "daily" | "weekly" | "monthly" */
    private String recurring;

    /** Marca explícita de completado (alternativa a status="done") */
    @Builder.Default
    private Boolean done = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Clases internas ────────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckItem {
        private String id;
        private String text;
        private boolean done;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Comment {
        private String id;
        private String authorId;
        private String authorName;
        private String authorInitials;
        private String text;
        private LocalDateTime createdAt;
    }
}

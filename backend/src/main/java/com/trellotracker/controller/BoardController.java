package com.trellotracker.controller;

import com.trellotracker.dto.*;
import com.trellotracker.model.Board;
import com.trellotracker.model.Card;
import com.trellotracker.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * BoardController extendido con endpoints para:
 * - Votar en tarjetas
 * - Añadir/eliminar checklist items
 * - Añadir comentarios
 * - Custom fields
 * - Reporte de tiempo por tablero
 */
@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BoardController {

    private final BoardService boardService;

    // ── Boards ─────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<Board> createBoard(@RequestBody BoardRequest request) {
        return ResponseEntity.ok(boardService.createBoard(request));
    }

    @GetMapping
    public ResponseEntity<List<Board>> getAllBoards() {
        return ResponseEntity.ok(boardService.getAllBoards());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Board> getBoard(@PathVariable String id) {
        return boardService.getBoard(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable String id) {
        boardService.deleteBoard(id);
        return ResponseEntity.ok().build();
    }

    /**
     * PUT /api/boards/{id}
     * Actualiza título, descripción, fondo (background) y favorito (starred) del tablero.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Board> updateBoard(@PathVariable String id, @RequestBody BoardRequest request) {
        return ResponseEntity.ok(boardService.updateBoard(id, request));
    }

    // ── Lists ──────────────────────────────────────────────────────────────

    @PostMapping("/{boardId}/lists")
    public ResponseEntity<Board> addList(
            @PathVariable String boardId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(boardService.addList(boardId, body.get("title")));
    }

    /** PUT /api/boards/{boardId}/lists/{listId} — renombra la lista. Body: { "title": "..." } */
    @PutMapping("/{boardId}/lists/{listId}")
    public ResponseEntity<Board> renameList(
            @PathVariable String boardId,
            @PathVariable String listId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(boardService.renameList(boardId, listId, body.get("title")));
    }

    /** DELETE /api/boards/{boardId}/lists/{listId} — elimina la lista y sus tarjetas. */
    @DeleteMapping("/{boardId}/lists/{listId}")
    public ResponseEntity<Board> deleteList(
            @PathVariable String boardId,
            @PathVariable String listId) {
        return ResponseEntity.ok(boardService.deleteList(boardId, listId));
    }

    // ── Cards ──────────────────────────────────────────────────────────────

    @PostMapping("/{boardId}/lists/{listId}/cards")
    public ResponseEntity<Board> addCard(
            @PathVariable String boardId,
            @PathVariable String listId,
            @RequestBody CardRequest request) {
        return ResponseEntity.ok(boardService.addCard(boardId, listId, request));
    }

    @PutMapping("/{boardId}/lists/{listId}/cards/{cardId}")
    public ResponseEntity<Board> updateCard(
            @PathVariable String boardId,
            @PathVariable String listId,
            @PathVariable String cardId,
            @RequestBody CardRequest request) {
        return ResponseEntity.ok(boardService.updateCard(boardId, listId, cardId, request));
    }

    @DeleteMapping("/{boardId}/lists/{listId}/cards/{cardId}")
    public ResponseEntity<Board> deleteCard(
            @PathVariable String boardId,
            @PathVariable String listId,
            @PathVariable String cardId) {
        return ResponseEntity.ok(boardService.deleteCard(boardId, listId, cardId));
    }

    @PostMapping("/{boardId}/cards/{cardId}/move")
    public ResponseEntity<Board> moveCard(
            @PathVariable String boardId,
            @PathVariable String cardId,
            @RequestBody MoveCardRequest request) {
        return ResponseEntity.ok(boardService.moveCard(boardId, cardId, request));
    }

    // ── Time tracking ──────────────────────────────────────────────────────

    @PostMapping("/{boardId}/lists/{listId}/cards/{cardId}/time")
    public ResponseEntity<Board> addTimeEntry(
            @PathVariable String boardId,
            @PathVariable String listId,
            @PathVariable String cardId,
            @RequestBody TimeEntryRequest request) {
        return ResponseEntity.ok(boardService.addTimeEntry(boardId, listId, cardId, request));
    }

    // ── Votes (NUEVO) ──────────────────────────────────────────────────────

    /**
     * POST /api/boards/{boardId}/lists/{listId}/cards/{cardId}/vote
     * Incrementa el contador de votos de una tarjeta.
     */
    @PostMapping("/{boardId}/lists/{listId}/cards/{cardId}/vote")
    public ResponseEntity<Board> voteCard(
            @PathVariable String boardId,
            @PathVariable String listId,
            @PathVariable String cardId) {
        return ResponseEntity.ok(boardService.voteCard(boardId, listId, cardId));
    }

    // ── Checklist (NUEVO) ──────────────────────────────────────────────────

    /**
     * POST /api/boards/{boardId}/lists/{listId}/cards/{cardId}/checklist
     * Body: { "text": "Hacer algo" }
     */
    @PostMapping("/{boardId}/lists/{listId}/cards/{cardId}/checklist")
    public ResponseEntity<Board> addCheckItem(
            @PathVariable String boardId,
            @PathVariable String listId,
            @PathVariable String cardId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                boardService.addCheckItem(boardId, listId, cardId, body.get("text")));
    }

    /**
     * PUT /api/boards/{boardId}/lists/{listId}/cards/{cardId}/checklist/{itemId}
     * Body: { "done": true }
     */
    @PutMapping("/{boardId}/lists/{listId}/cards/{cardId}/checklist/{itemId}")
    public ResponseEntity<Board> toggleCheckItem(
            @PathVariable String boardId,
            @PathVariable String listId,
            @PathVariable String cardId,
            @PathVariable String itemId,
            @RequestBody Map<String, Boolean> body) {
        boolean done = Boolean.TRUE.equals(body.get("done"));
        return ResponseEntity.ok(
                boardService.toggleCheckItem(boardId, listId, cardId, itemId, done));
    }

    /**
     * DELETE /api/boards/{boardId}/lists/{listId}/cards/{cardId}/checklist/{itemId}
     * Elimina un item del checklist.
     */
    @DeleteMapping("/{boardId}/lists/{listId}/cards/{cardId}/checklist/{itemId}")
    public ResponseEntity<Board> deleteCheckItem(
            @PathVariable String boardId,
            @PathVariable String listId,
            @PathVariable String cardId,
            @PathVariable String itemId) {
        return ResponseEntity.ok(
                boardService.deleteCheckItem(boardId, listId, cardId, itemId));
    }

    // ── Comments (NUEVO) ──────────────────────────────────────────────────

    /**
     * POST /api/boards/{boardId}/lists/{listId}/cards/{cardId}/comments
     * Body: { "authorId": "me", "authorName": "Tú", "text": "Mensaje" }
     */
    @PostMapping("/{boardId}/lists/{listId}/cards/{cardId}/comments")
    public ResponseEntity<Board> addComment(
            @PathVariable String boardId,
            @PathVariable String listId,
            @PathVariable String cardId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                boardService.addComment(boardId, listId, cardId,
                        body.get("authorId"), body.get("authorName"),
                        body.get("authorInitials"), body.get("text")));
    }

    // ── Custom fields (NUEVO) ──────────────────────────────────────────────

    /**
     * PUT /api/boards/{boardId}/lists/{listId}/cards/{cardId}/fields
     * Body: { "fieldName": "fieldValue", ... }
     */
    @PutMapping("/{boardId}/lists/{listId}/cards/{cardId}/fields")
    public ResponseEntity<Board> updateCustomFields(
            @PathVariable String boardId,
            @PathVariable String listId,
            @PathVariable String cardId,
            @RequestBody Map<String, String> fields) {
        return ResponseEntity.ok(
                boardService.updateCustomFields(boardId, listId, cardId, fields));
    }

    // ── Reports (NUEVO) ───────────────────────────────────────────────────

    /**
     * GET /api/boards/{boardId}/reports
     * Retorna estadísticas de tiempo, tarjetas por estado, etc.
     */
    @GetMapping("/{boardId}/reports")
    public ResponseEntity<Map<String, Object>> getBoardReport(@PathVariable String boardId) {
        return ResponseEntity.ok(boardService.getBoardReport(boardId));
    }

    // ── Templates ─────────────────────────────────────────────────────────

    @GetMapping("/templates")
    public ResponseEntity<?> getTemplates() {
        return ResponseEntity.ok(List.of(
            Map.of("id","kanban","name","Kanban","lists",List.of("Por hacer","En progreso","Hecho")),
            Map.of("id","scrum","name","Scrum","lists",List.of("Backlog","Por hacer","En progreso","Revisión","Hecho")),
            Map.of("id","personal","name","Personal","lists",List.of("Ideas","Hoy","Esta semana","Hecho")),
            Map.of("id","blank","name","En blanco","lists",List.of())
        ));
    }
}

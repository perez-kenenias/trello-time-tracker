package com.trellotracker.controller;

import com.trellotracker.dto.*;
import com.trellotracker.model.Board;
import com.trellotracker.model.Template;
import com.trellotracker.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BoardController {

    private final BoardService boardService;

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
        return boardService.getBoard(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable String id) {
        boardService.deleteBoard(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{boardId}/lists")
    public ResponseEntity<Board> addList(@PathVariable String boardId, @RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(boardService.addList(boardId, body.get("title")));
    }

    @PostMapping("/{boardId}/lists/{listId}/cards")
    public ResponseEntity<Board> addCard(@PathVariable String boardId, @PathVariable String listId, @RequestBody CardRequest request) {
        return ResponseEntity.ok(boardService.addCard(boardId, listId, request));
    }

    @PutMapping("/{boardId}/lists/{listId}/cards/{cardId}")
    public ResponseEntity<Board> updateCard(@PathVariable String boardId, @PathVariable String listId, @PathVariable String cardId, @RequestBody CardRequest request) {
        return ResponseEntity.ok(boardService.updateCard(boardId, listId, cardId, request));
    }

    @DeleteMapping("/{boardId}/lists/{listId}/cards/{cardId}")
    public ResponseEntity<Board> deleteCard(@PathVariable String boardId, @PathVariable String listId, @PathVariable String cardId) {
        return ResponseEntity.ok(boardService.deleteCard(boardId, listId, cardId));
    }

    @PostMapping("/{boardId}/cards/{cardId}/move")
    public ResponseEntity<Board> moveCard(@PathVariable String boardId, @PathVariable String cardId, @RequestBody MoveCardRequest request) {
        return ResponseEntity.ok(boardService.moveCard(boardId, cardId, request));
    }

    @PostMapping("/{boardId}/lists/{listId}/cards/{cardId}/time")
    public ResponseEntity<Board> addTimeEntry(@PathVariable String boardId, @PathVariable String listId, @PathVariable String cardId, @RequestBody TimeEntryRequest request) {
        return ResponseEntity.ok(boardService.addTimeEntry(boardId, listId, cardId, request));
    }
}

package com.trellotracker.controller;

import com.trellotracker.model.Template;
import com.trellotracker.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TemplateController {

    private final BoardService boardService;

    @GetMapping
    public ResponseEntity<List<Template>> getTemplates() {
        return ResponseEntity.ok(boardService.getTemplates());
    }
}

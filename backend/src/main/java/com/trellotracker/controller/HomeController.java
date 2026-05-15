package com.trellotracker.controller;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Locale;
import java.util.Map;

@RestController
public class HomeController {

    private final MessageSource messageSource;

    public HomeController(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    @GetMapping("/")
    public Map<String, Object> home(@RequestParam(value = "lang", required = false) String lang) {
        if (lang != null) {
            LocaleContextHolder.setLocale(new Locale(lang));
        }
        Locale locale = LocaleContextHolder.getLocale();

        return Map.of(
            "message", messageSource.getMessage("board.title", null, locale),
            "status", messageSource.getMessage("board.status", null, "UP", locale),
            "version", "1.0.0",
            "language", locale.getLanguage(),
            "endpoints", Map.of(
                "boards", "/api/boards",
                "templates", "/api/templates",
                "swagger_ui", "/swagger-ui.html",
                "api_docs", "/v3/api-docs"
            )
        );
    }
}

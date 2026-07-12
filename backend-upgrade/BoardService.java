package com.trellotracker.service;

import com.trellotracker.dto.*;
import com.trellotracker.model.*;
import com.trellotracker.repository.BoardRepository;
import com.trellotracker.repository.TemplateRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * BoardService extendido con soporte completo para:
 *  - Votos en tarjetas
 *  - Checklist (add / toggle / delete)
 *  - Comentarios
 *  - Campos personalizados
 *  - Informe de tiempo por tablero
 */
@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final TemplateRepository templateRepository;

    // ── Init templates ────────────────────────────────────────────────────
    @PostConstruct
    public void initTemplates() {
        if (templateRepository.count() == 0) {
            templateRepository.save(Template.builder()
                    .name("Scrum").description("Standard Scrum board").type("scrum")
                    .defaultLists(Arrays.asList("Backlog","To Do","In Progress","Review","Done")).build());
            templateRepository.save(Template.builder()
                    .name("Kanban").description("Simple Kanban flow").type("kanban")
                    .defaultLists(Arrays.asList("To Do","In Progress","Done")).build());
            templateRepository.save(Template.builder()
                    .name("Daily Life").description("Organize daily activities").type("daily")
                    .defaultLists(Arrays.asList("Morning","Afternoon","Evening","Notes")).build());
            templateRepository.save(Template.builder()
                    .name("Project Management").description("Full project lifecycle").type("project")
                    .defaultLists(Arrays.asList("Planning","Execution","Testing","Deployment","Maintenance")).build());
            // NEW: Personal (matches new frontend)
            templateRepository.save(Template.builder()
                    .name("Personal").description("Personal task management").type("personal")
                    .defaultLists(Arrays.asList("Ideas","Hoy","Esta semana","Hecho")).build());
        }
    }

    // ── Board CRUD ────────────────────────────────────────────────────────
    public Board createBoard(BoardRequest request) {
        Board board = new Board();
        board.setTitle(request.getTitle());
        board.setDescription(request.getDescription());
        board.setTemplateType(request.getTemplateType());
        board.setCreatedAt(LocalDateTime.now());
        board.setUpdatedAt(LocalDateTime.now());

        List<String> listTitles = new ArrayList<>();
        if (request.getListTitles() != null && !request.getListTitles().isEmpty()) {
            listTitles = request.getListTitles();
        } else if (request.getTemplateType() != null) {
            templateRepository.findByType(request.getTemplateType().toLowerCase())
                    .ifPresent(t -> listTitles.addAll(t.getDefaultLists()));
        }

        List<BoardList> lists = new ArrayList<>();
        for (int i = 0; i < listTitles.size(); i++) {
            BoardList bl = new BoardList();
            bl.setId(UUID.randomUUID().toString());
            bl.setTitle(listTitles.get(i));
            bl.setOrder(i);
            bl.setCards(new ArrayList<>());
            lists.add(bl);
        }
        board.setLists(lists);
        return boardRepository.save(board);
    }

    public List<Board> getAllBoards() { return boardRepository.findAll(); }

    public Optional<Board> getBoard(String id) { return boardRepository.findById(id); }

    public void deleteBoard(String id) { boardRepository.deleteById(id); }

    // ── List ─────────────────────────────────────────────────────────────
    public Board addList(String boardId, String title) {
        Board board = boardRepository.findById(boardId).orElseThrow();
        BoardList bl = new BoardList();
        bl.setId(UUID.randomUUID().toString());
        bl.setTitle(title);
        bl.setOrder(board.getLists().size());
        bl.setCards(new ArrayList<>());
        board.getLists().add(bl);
        board.setUpdatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }

    // ── Card CRUD ─────────────────────────────────────────────────────────
    public Board addCard(String boardId, String listId, CardRequest request) {
        Board board = boardRepository.findById(boardId).orElseThrow();
        Card card = new Card();
        card.setId(UUID.randomUUID().toString());
        card.setTitle(request.getTitle());
        card.setDescription(request.getDescription());
        card.setPriority(request.getPriority());
        card.setStatus(request.getStatus() != null ? request.getStatus() : "active");
        card.setDone(false);
        card.setTags(request.getTags() != null ? request.getTags() : new ArrayList<>());
        card.setDueDate(request.getDueDate());
        card.setTimeEntries(new ArrayList<>());
        card.setTotalMinutesSpent(0L);
        card.setVotes(0);
        card.setChecklist(new ArrayList<>());
        card.setComments(new ArrayList<>());
        card.setLabels(new HashMap<>());
        card.setCustomFields(new HashMap<>());
        card.setAssignedMembers(new ArrayList<>());
        card.setCreatedAt(LocalDateTime.now());
        card.setUpdatedAt(LocalDateTime.now());

        for (BoardList bl : board.getLists()) {
            if (bl.getId().equals(listId)) {
                card.setOrder(bl.getCards().size());
                bl.getCards().add(card);
                break;
            }
        }
        board.setUpdatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }

    public Board updateCard(String boardId, String listId, String cardId, CardRequest request) {
        Board board = boardRepository.findById(boardId).orElseThrow();
        findCard(board, listId, cardId).ifPresent(card -> {
            if (request.getTitle() != null)       card.setTitle(request.getTitle());
            if (request.getDescription() != null) card.setDescription(request.getDescription());
            if (request.getPriority() != null)    card.setPriority(request.getPriority());
            if (request.getStatus() != null) {
                card.setStatus(request.getStatus());
                card.setDone("done".equalsIgnoreCase(request.getStatus()));
            }
            if (request.getDueDate() != null)     card.setDueDate(request.getDueDate());
            if (request.getTags() != null)        card.setTags(request.getTags());
            card.setUpdatedAt(LocalDateTime.now());
        });
        board.setUpdatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }

    public Board deleteCard(String boardId, String listId, String cardId) {
        Board board = boardRepository.findById(boardId).orElseThrow();
        board.getLists().stream()
                .filter(bl -> bl.getId().equals(listId))
                .findFirst()
                .ifPresent(bl -> bl.getCards().removeIf(c -> c.getId().equals(cardId)));
        board.setUpdatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }

    public Board moveCard(String boardId, String cardId, MoveCardRequest request) {
        Board board = boardRepository.findById(boardId).orElseThrow();
        Card card = null;
        BoardList sourceList = null;

        outer:
        for (BoardList bl : board.getLists()) {
            for (Card c : bl.getCards()) {
                if (c.getId().equals(cardId)) { card = c; sourceList = bl; break outer; }
            }
        }

        if (card != null && sourceList != null) {
            sourceList.getCards().remove(card);
            String targetId = request.getTargetListId() != null ? request.getTargetListId() : request.getSourceListId();
            for (BoardList bl : board.getLists()) {
                if (bl.getId().equals(targetId)) {
                    int pos = request.getNewOrder() != null ? request.getNewOrder() : bl.getCards().size();
                    card.setOrder(Math.min(pos, bl.getCards().size()));
                    card.setStatus(bl.getTitle());
                    bl.getCards().add(Math.min(pos, bl.getCards().size()), card);
                    break;
                }
            }
        }
        board.setUpdatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }

    // ── Time tracking ─────────────────────────────────────────────────────
    public Board addTimeEntry(String boardId, String listId, String cardId, TimeEntryRequest request) {
        Board board = boardRepository.findById(boardId).orElseThrow();
        findCard(board, listId, cardId).ifPresent(card -> {
            TimeEntry entry = new TimeEntry();
            entry.setId(UUID.randomUUID().toString());
            entry.setDescription(request.getDescription());
            entry.setStartTime(request.getStartTime());
            entry.setEndTime(request.getEndTime());
            if (request.getStartTime() != null && request.getEndTime() != null) {
                entry.setMinutes(java.time.Duration.between(request.getStartTime(), request.getEndTime()).toMinutes());
            } else {
                entry.setMinutes(request.getMinutes() != null ? request.getMinutes() : 0L);
            }
            entry.setCreatedAt(LocalDateTime.now());
            card.getTimeEntries().add(entry);
            card.setTotalMinutesSpent(card.getTimeEntries().stream().mapToLong(TimeEntry::getMinutes).sum());
            card.setUpdatedAt(LocalDateTime.now());
        });
        board.setUpdatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }

    // ── Votes (NEW) ───────────────────────────────────────────────────────
    public Board voteCard(String boardId, String listId, String cardId) {
        Board board = boardRepository.findById(boardId).orElseThrow();
        findCard(board, listId, cardId).ifPresent(card -> {
            card.setVotes((card.getVotes() == null ? 0 : card.getVotes()) + 1);
            card.setUpdatedAt(LocalDateTime.now());
        });
        board.setUpdatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }

    // ── Checklist (NEW) ───────────────────────────────────────────────────
    public Board addCheckItem(String boardId, String listId, String cardId, String text) {
        Board board = boardRepository.findById(boardId).orElseThrow();
        findCard(board, listId, cardId).ifPresent(card -> {
            if (card.getChecklist() == null) card.setChecklist(new ArrayList<>());
            Card.CheckItem item = new Card.CheckItem(
                    UUID.randomUUID().toString(), text, false, LocalDateTime.now());
            card.getChecklist().add(item);
            card.setUpdatedAt(LocalDateTime.now());
        });
        board.setUpdatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }

    public Board toggleCheckItem(String boardId, String listId, String cardId, String itemId, boolean done) {
        Board board = boardRepository.findById(boardId).orElseThrow();
        findCard(board, listId, cardId).ifPresent(card -> {
            if (card.getChecklist() == null) return;
            card.getChecklist().stream()
                    .filter(i -> i.getId().equals(itemId))
                    .findFirst()
                    .ifPresent(i -> i.setDone(done));
            card.setUpdatedAt(LocalDateTime.now());
        });
        board.setUpdatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }

    public Board deleteCheckItem(String boardId, String listId, String cardId, String itemId) {
        Board board = boardRepository.findById(boardId).orElseThrow();
        findCard(board, listId, cardId).ifPresent(card -> {
            if (card.getChecklist() != null) card.getChecklist().removeIf(i -> i.getId().equals(itemId));
            card.setUpdatedAt(LocalDateTime.now());
        });
        board.setUpdatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }

    // ── Comments (NEW) ────────────────────────────────────────────────────
    public Board addComment(String boardId, String listId, String cardId,
                            String authorId, String authorName, String authorInitials, String text) {
        Board board = boardRepository.findById(boardId).orElseThrow();
        findCard(board, listId, cardId).ifPresent(card -> {
            if (card.getComments() == null) card.setComments(new ArrayList<>());
            Card.Comment comment = new Card.Comment(
                    UUID.randomUUID().toString(),
                    authorId, authorName, authorInitials,
                    text, LocalDateTime.now());
            card.getComments().add(comment);
            card.setUpdatedAt(LocalDateTime.now());
        });
        board.setUpdatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }

    // ── Custom fields (NEW) ───────────────────────────────────────────────
    public Board updateCustomFields(String boardId, String listId, String cardId, Map<String, String> fields) {
        Board board = boardRepository.findById(boardId).orElseThrow();
        findCard(board, listId, cardId).ifPresent(card -> {
            if (card.getCustomFields() == null) card.setCustomFields(new HashMap<>());
            card.getCustomFields().putAll(fields);
            card.setUpdatedAt(LocalDateTime.now());
        });
        board.setUpdatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }

    // ── Reports (NEW) ─────────────────────────────────────────────────────
    public Map<String, Object> getBoardReport(String boardId) {
        Board board = boardRepository.findById(boardId).orElseThrow();
        Map<String, Object> report = new LinkedHashMap<>();

        int totalCards = 0, doneCards = 0, overdueCards = 0;
        long totalMinutes = 0;
        List<Map<String, Object>> byList = new ArrayList<>();
        List<Map<String, Object>> timeEntries = new ArrayList<>();

        LocalDateTime now = LocalDateTime.now();

        for (BoardList bl : board.getLists()) {
            long listMin = 0;
            int listTotal = 0, listDone = 0;

            for (Card c : bl.getCards()) {
                totalCards++;
                listTotal++;
                if (Boolean.TRUE.equals(c.getDone()) || "done".equalsIgnoreCase(c.getStatus())) {
                    doneCards++; listDone++;
                }
                if (c.getDueDate() != null && c.getDueDate().isBefore(now)
                        && !Boolean.TRUE.equals(c.getDone())) {
                    overdueCards++;
                }
                long cardMin = c.getTotalMinutesSpent() != null ? c.getTotalMinutesSpent() : 0L;
                listMin += cardMin;
                totalMinutes += cardMin;

                if (c.getTimeEntries() != null) {
                    for (TimeEntry te : c.getTimeEntries()) {
                        Map<String, Object> entry = new LinkedHashMap<>();
                        entry.put("cardId", c.getId());
                        entry.put("cardTitle", c.getTitle());
                        entry.put("listId", bl.getId());
                        entry.put("listName", bl.getTitle());
                        entry.put("minutes", te.getMinutes());
                        entry.put("description", te.getDescription());
                        entry.put("startTime", te.getStartTime());
                        entry.put("endTime", te.getEndTime());
                        timeEntries.add(entry);
                    }
                }
            }

            Map<String, Object> listStat = new LinkedHashMap<>();
            listStat.put("listId", bl.getId());
            listStat.put("listName", bl.getTitle());
            listStat.put("totalCards", listTotal);
            listStat.put("doneCards", listDone);
            listStat.put("totalMinutes", listMin);
            byList.add(listStat);
        }

        report.put("boardId", boardId);
        report.put("boardTitle", board.getTitle());
        report.put("totalCards", totalCards);
        report.put("doneCards", doneCards);
        report.put("overdueCards", overdueCards);
        report.put("totalMinutesSpent", totalMinutes);
        report.put("byList", byList);
        report.put("timeEntries", timeEntries);
        report.put("generatedAt", now.toString());
        return report;
    }

    public List<Template> getTemplates() { return templateRepository.findAll(); }

    // ── Helper ────────────────────────────────────────────────────────────
    private Optional<Card> findCard(Board board, String listId, String cardId) {
        return board.getLists().stream()
                .filter(bl -> bl.getId().equals(listId))
                .findFirst()
                .flatMap(bl -> bl.getCards().stream().filter(c -> c.getId().equals(cardId)).findFirst());
    }
}

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

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final TemplateRepository templateRepository;

    @PostConstruct
    public void initTemplates() {
        if (templateRepository.count() == 0) {
            templateRepository.save(Template.builder()
                    .name("Scrum")
                    .description("Standard Scrum board with Backlog, To Do, In Progress, Review, Done")
                    .type("scrum")
                    .defaultLists(Arrays.asList("Backlog", "To Do", "In Progress", "Review", "Done"))
                    .build());

            templateRepository.save(Template.builder()
                    .name("Kanban")
                    .description("Simple Kanban flow with To Do, In Progress, Done")
                    .type("kanban")
                    .defaultLists(Arrays.asList("To Do", "In Progress", "Done"))
                    .build());

            templateRepository.save(Template.builder()
                    .name("Daily Life")
                    .description("Organize your daily activities")
                    .type("daily")
                    .defaultLists(Arrays.asList("Morning", "Afternoon", "Evening", "Notes"))
                    .build());

            templateRepository.save(Template.builder()
                    .name("Project Management")
                    .description("Manage projects with Planning, Execution, Testing, Deployment")
                    .type("project")
                    .defaultLists(Arrays.asList("Planning", "Execution", "Testing", "Deployment", "Maintenance"))
                    .build());
        }
    }

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
            Optional<Template> templateOpt = templateRepository.findByType(request.getTemplateType().toLowerCase());
            if (templateOpt.isPresent()) {
                listTitles = templateOpt.get().getDefaultLists();
            }
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

    public List<Board> getAllBoards() {
        return boardRepository.findAll();
    }

    public Optional<Board> getBoard(String id) {
        return boardRepository.findById(id);
    }

    public void deleteBoard(String id) {
        boardRepository.deleteById(id);
    }

    public Board addCard(String boardId, String listId, CardRequest request) {
        Board board = boardRepository.findById(boardId).orElseThrow();
        Card card = new Card();
        card.setId(UUID.randomUUID().toString());
        card.setTitle(request.getTitle());
        card.setDescription(request.getDescription());
        card.setPriority(request.getPriority());
        card.setStatus(request.getStatus());
        card.setTags(request.getTags() != null ? request.getTags() : new ArrayList<>());
        card.setDueDate(request.getDueDate());
        card.setTimeEntries(new ArrayList<>());
        card.setTotalMinutesSpent(0L);
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
        for (BoardList bl : board.getLists()) {
            if (bl.getId().equals(listId)) {
                for (Card card : bl.getCards()) {
                    if (card.getId().equals(cardId)) {
                        card.setTitle(request.getTitle());
                        card.setDescription(request.getDescription());
                        card.setPriority(request.getPriority());
                        card.setStatus(request.getStatus());
                        card.setTags(request.getTags() != null ? request.getTags() : card.getTags());
                        card.setDueDate(request.getDueDate());
                        card.setUpdatedAt(LocalDateTime.now());
                        break;
                    }
                }
                break;
            }
        }
        board.setUpdatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }

    public Board deleteCard(String boardId, String listId, String cardId) {
        Board board = boardRepository.findById(boardId).orElseThrow();
        for (BoardList bl : board.getLists()) {
            if (bl.getId().equals(listId)) {
                bl.getCards().removeIf(c -> c.getId().equals(cardId));
                break;
            }
        }
        board.setUpdatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }

    public Board moveCard(String boardId, String cardId, MoveCardRequest request) {
        Board board = boardRepository.findById(boardId).orElseThrow();
        Card card = null;
        BoardList sourceList = null;

        for (BoardList bl : board.getLists()) {
            if (bl.getId().equals(request.getSourceListId())) {
                for (Card c : bl.getCards()) {
                    if (c.getId().equals(cardId)) {
                        card = c;
                        sourceList = bl;
                        break;
                    }
                }
            }
        }

        if (card != null && sourceList != null) {
            sourceList.getCards().remove(card);
            for (BoardList bl : board.getLists()) {
                if (bl.getId().equals(request.getTargetListId())) {
                    card.setOrder(request.getNewOrder() != null ? request.getNewOrder() : bl.getCards().size());
                    card.setStatus(bl.getTitle());
                    bl.getCards().add(card);
                    break;
                }
            }
        }
        board.setUpdatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }

    public Board addTimeEntry(String boardId, String listId, String cardId, TimeEntryRequest request) {
        Board board = boardRepository.findById(boardId).orElseThrow();
        for (BoardList bl : board.getLists()) {
            if (bl.getId().equals(listId)) {
                for (Card card : bl.getCards()) {
                    if (card.getId().equals(cardId)) {
                        TimeEntry entry = new TimeEntry();
                        entry.setId(UUID.randomUUID().toString());
                        entry.setDescription(request.getDescription());
                        entry.setStartTime(request.getStartTime());
                        entry.setEndTime(request.getEndTime());
                        if (request.getStartTime() != null && request.getEndTime() != null) {
                            entry.setMinutes(java.time.Duration.between(request.getStartTime(), request.getEndTime()).toMinutes());
                        } else {
                            entry.setMinutes(0L);
                        }
                        entry.setCreatedAt(LocalDateTime.now());
                        card.getTimeEntries().add(entry);
                        card.setTotalMinutesSpent(card.getTimeEntries().stream().mapToLong(TimeEntry::getMinutes).sum());
                        card.setUpdatedAt(LocalDateTime.now());
                        break;
                    }
                }
                break;
            }
        }
        board.setUpdatedAt(LocalDateTime.now());
        return boardRepository.save(board);
    }

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

    public List<Template> getTemplates() {
        return templateRepository.findAll();
    }
}

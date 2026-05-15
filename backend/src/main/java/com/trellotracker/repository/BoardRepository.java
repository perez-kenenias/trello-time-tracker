package com.trellotracker.repository;

import com.trellotracker.model.Board;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends MongoRepository<Board, String> {
    List<Board> findByTemplateType(String templateType);
}

package com.trellotracker.repository;

import com.trellotracker.model.Template;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TemplateRepository extends MongoRepository<Template, String> {
    Optional<Template> findByType(String type);
}

package com.example._AD028.repository;

import com.example._AD028.entity.RatingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<RatingEntity, Long> {

    Optional<RatingEntity> findByStudentIdAndNoteId(
            Long studentId,
            Long noteId
    );

    List<RatingEntity> findByNoteId(Long noteId);

    List<RatingEntity> findByStudentId(Long studentId);
}
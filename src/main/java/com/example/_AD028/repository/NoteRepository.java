package com.example._AD028.repository;

import com.example._AD028.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findBySubjectId(Long subjectId);

    List<Note> findBySubjectIdAndUnit(Long subjectId, String unit);

    List<Note> findByUploaderId(Long studentId);
}
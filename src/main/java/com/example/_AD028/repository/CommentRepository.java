package com.example._AD028.repository;

import com.example._AD028.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByNoteId(Long noteId);

    List<Comment> findByStudentId(Long studentId);
}
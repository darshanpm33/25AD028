package com.example._AD028.controller;

import com.example._AD028.entity.Comment;
import com.example._AD028.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // CREATE COMMENT
    @PostMapping
    public ResponseEntity<Comment> createComment(
            @RequestBody CommentRequest request) {

        Comment comment = commentService.createComment(
                request.getContent(),
                request.getStudentId(),
                request.getNoteId()
        );

        return ResponseEntity.ok(comment);
    }

    // GET ALL COMMENTS
    @GetMapping
    public ResponseEntity<List<Comment>> getAllComments() {
        return ResponseEntity.ok(
                commentService.getAllComments()
        );
    }

    // GET COMMENT BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Comment> getCommentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                commentService.getCommentById(id)
        );
    }

    // GET COMMENTS FOR A NOTE
    @GetMapping("/note/{noteId}")
    public ResponseEntity<List<Comment>> getCommentsByNote(
            @PathVariable Long noteId) {

        return ResponseEntity.ok(
                commentService.getCommentsByNote(noteId)
        );
    }

    // GET COMMENTS BY A STUDENT
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Comment>> getCommentsByStudent(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                commentService.getCommentsByStudent(studentId)
        );
    }

    // DELETE COMMENT
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteComment(
            @PathVariable Long id) {

        commentService.deleteComment(id);

        return ResponseEntity.ok(
                "Comment deleted successfully"
        );
    }

    // REQUEST DTO
    public static class CommentRequest {

        private String content;
        private Long studentId;
        private Long noteId;

        public CommentRequest() {
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public Long getNoteId() {
            return noteId;
        }

        public void setNoteId(Long noteId) {
            this.noteId = noteId;
        }
    }
}
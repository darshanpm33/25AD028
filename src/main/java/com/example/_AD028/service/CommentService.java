package com.example._AD028.service;

import com.example._AD028.entity.Comment;
import com.example._AD028.entity.Note;
import com.example._AD028.entity.Student;
import com.example._AD028.repository.CommentRepository;
import com.example._AD028.repository.NoteRepository;
import com.example._AD028.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final StudentRepository studentRepository;
    private final NoteRepository noteRepository;

    public CommentService(
            CommentRepository commentRepository,
            StudentRepository studentRepository,
            NoteRepository noteRepository) {

        this.commentRepository = commentRepository;
        this.studentRepository = studentRepository;
        this.noteRepository = noteRepository;
    }

    // CREATE COMMENT
    public Comment createComment(
            String content,
            Long studentId,
            Long noteId) {

        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException(
                    "Comment content cannot be empty"
            );
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Student not found with ID: " + studentId
                        )
                );

        Note note = noteRepository.findById(noteId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Note not found with ID: " + noteId
                        )
                );

        Comment comment = new Comment(
                content,
                student,
                note
        );

        return commentRepository.save(comment);
    }

    // GET ALL COMMENTS
    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }

    // GET COMMENT BY ID
    public Comment getCommentById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Comment not found with ID: " + id
                        )
                );
    }

    // GET COMMENTS FOR A NOTE
    public List<Comment> getCommentsByNote(Long noteId) {

        if (!noteRepository.existsById(noteId)) {
            throw new RuntimeException(
                    "Note not found with ID: " + noteId
            );
        }

        return commentRepository.findByNoteId(noteId);
    }

    // GET COMMENTS BY A STUDENT
    public List<Comment> getCommentsByStudent(Long studentId) {

        if (!studentRepository.existsById(studentId)) {
            throw new RuntimeException(
                    "Student not found with ID: " + studentId
            );
        }

        return commentRepository.findByStudentId(studentId);
    }

    // DELETE COMMENT
    public void deleteComment(Long id) {

        if (!commentRepository.existsById(id)) {
            throw new RuntimeException(
                    "Comment not found with ID: " + id
            );
        }

        commentRepository.deleteById(id);
    }
}
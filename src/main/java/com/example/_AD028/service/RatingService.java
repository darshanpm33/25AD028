package com.example._AD028.service;

import com.example._AD028.entity.Note;
import com.example._AD028.entity.RatingEntity;
import com.example._AD028.entity.Student;
import com.example._AD028.repository.NoteRepository;
import com.example._AD028.repository.RatingRepository;
import com.example._AD028.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final StudentRepository studentRepository;
    private final NoteRepository noteRepository;

    public RatingService(
            RatingRepository ratingRepository,
            StudentRepository studentRepository,
            NoteRepository noteRepository) {

        this.ratingRepository = ratingRepository;
        this.studentRepository = studentRepository;
        this.noteRepository = noteRepository;
    }

    // CREATE RATING
    public RatingEntity createRating(
            int rating,
            Long studentId,
            Long noteId) {

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new RuntimeException(
                    "Rating must be between 1 and 5"
            );
        }

        // Check student
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Student not found with ID: " + studentId
                        )
                );

        // Check note
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Note not found with ID: " + noteId
                        )
                );

        // Check if student already rated this note
        if (ratingRepository
                .findByStudentIdAndNoteId(studentId, noteId)
                .isPresent()) {

            throw new RuntimeException(
                    "Student has already rated this note"
            );
        }

        RatingEntity newRating = new RatingEntity(
                rating,
                student,
                note
        );

        return ratingRepository.save(newRating);
    }

    // GET ALL RATINGS
    public List<RatingEntity> getAllRatings() {
        return ratingRepository.findAll();
    }

    // GET RATING BY ID
    public RatingEntity getRatingById(Long id) {
        return ratingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Rating not found with ID: " + id
                        )
                );
    }

    // GET RATINGS FOR A NOTE
    public List<RatingEntity> getRatingsByNote(Long noteId) {

        if (!noteRepository.existsById(noteId)) {
            throw new RuntimeException(
                    "Note not found with ID: " + noteId
            );
        }

        return ratingRepository.findByNoteId(noteId);
    }

    // GET RATINGS BY A STUDENT
    public List<RatingEntity> getRatingsByStudent(Long studentId) {

        if (!studentRepository.existsById(studentId)) {
            throw new RuntimeException(
                    "Student not found with ID: " + studentId
            );
        }

        return ratingRepository.findByStudentId(studentId);
    }

    // DELETE RATING
    public void deleteRating(Long id) {

        if (!ratingRepository.existsById(id)) {
            throw new RuntimeException(
                    "Rating not found with ID: " + id
            );
        }

        ratingRepository.deleteById(id);
    }
}
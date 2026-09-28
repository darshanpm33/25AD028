package com.example._AD028.controller;

import com.example._AD028.entity.RatingEntity;
import com.example._AD028.service.RatingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    // CREATE RATING
    @PostMapping
    public ResponseEntity<RatingEntity> createRating(
            @RequestBody RatingRequest request) {

        RatingEntity rating = ratingService.createRating(
                request.getRating(),
                request.getStudentId(),
                request.getNoteId()
        );

        return ResponseEntity.ok(rating);
    }

    // GET ALL RATINGS
    @GetMapping
    public ResponseEntity<List<RatingEntity>> getAllRatings() {
        return ResponseEntity.ok(
                ratingService.getAllRatings()
        );
    }

    // GET RATING BY ID
    @GetMapping("/{id}")
    public ResponseEntity<RatingEntity> getRatingById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ratingService.getRatingById(id)
        );
    }

    // GET RATINGS FOR A NOTE
    @GetMapping("/note/{noteId}")
    public ResponseEntity<List<RatingEntity>> getRatingsByNote(
            @PathVariable Long noteId) {

        return ResponseEntity.ok(
                ratingService.getRatingsByNote(noteId)
        );
    }

    // GET RATINGS BY STUDENT
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<RatingEntity>> getRatingsByStudent(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                ratingService.getRatingsByStudent(studentId)
        );
    }

    // DELETE RATING
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRating(
            @PathVariable Long id) {

        ratingService.deleteRating(id);

        return ResponseEntity.ok(
                "Rating deleted successfully"
        );
    }

    // REQUEST DTO
    public static class RatingRequest {

        private int rating;
        private Long studentId;
        private Long noteId;

        public RatingRequest() {
        }

        public int getRating() {
            return rating;
        }

        public void setRating(int rating) {
            this.rating = rating;
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
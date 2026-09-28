package com.example._AD028.controller;

import com.example._AD028.entity.Note;
import com.example._AD028.service.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    // CREATE NOTE
    @PostMapping
    public ResponseEntity<Note> uploadNote(
            @RequestBody NoteRequest request) {

        Note note = noteService.uploadNote(
                request.getTitle(),
                request.getUnit(),
                request.getFileName(),
                request.getFileUrl(),
                request.getStudentId(),
                request.getSubjectId()
        );

        return ResponseEntity.ok(note);
    }

    // GET ALL NOTES
    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes() {
        return ResponseEntity.ok(
                noteService.getAllNotes()
        );
    }

    // GET NOTE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                noteService.getNoteById(id)
        );
    }

    // GET NOTES BY SUBJECT
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<Note>> getNotesBySubject(
            @PathVariable Long subjectId) {

        return ResponseEntity.ok(
                noteService.getNotesBySubject(subjectId)
        );
    }

    // GET NOTES BY SUBJECT AND UNIT
    @GetMapping("/subject/{subjectId}/unit/{unit}")
    public ResponseEntity<List<Note>> getNotesBySubjectAndUnit(
            @PathVariable Long subjectId,
            @PathVariable String unit) {

        return ResponseEntity.ok(
                noteService.getNotesBySubjectAndUnit(
                        subjectId,
                        unit
                )
        );
    }

    // GET NOTES BY STUDENT
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Note>> getNotesByStudent(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                noteService.getNotesByStudent(studentId)
        );
    }

    // DELETE NOTE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNote(
            @PathVariable Long id) {

        noteService.deleteNote(id);

        return ResponseEntity.ok(
                "Note deleted successfully"
        );
    }

    // REQUEST DTO
    public static class NoteRequest {

        private String title;
        private String unit;
        private String fileName;
        private String fileUrl;
        private Long studentId;
        private Long subjectId;

        public NoteRequest() {
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getUnit() {
            return unit;
        }

        public void setUnit(String unit) {
            this.unit = unit;
        }

        public String getFileName() {
            return fileName;
        }

        public void setFileName(String fileName) {
            this.fileName = fileName;
        }

        public String getFileUrl() {
            return fileUrl;
        }

        public void setFileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public Long getSubjectId() {
            return subjectId;
        }

        public void setSubjectId(Long subjectId) {
            this.subjectId = subjectId;
        }
    }
}
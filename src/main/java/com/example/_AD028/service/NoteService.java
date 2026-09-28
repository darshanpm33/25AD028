package com.example._AD028.service;

import com.example._AD028.entity.Note;
import com.example._AD028.entity.Student;
import com.example._AD028.entity.Subject;
import com.example._AD028.repository.NoteRepository;
import com.example._AD028.repository.StudentRepository;
import com.example._AD028.repository.SubjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;

    public NoteService(
            NoteRepository noteRepository,
            StudentRepository studentRepository,
            SubjectRepository subjectRepository) {

        this.noteRepository = noteRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
    }

    // CREATE NOTE
    public Note uploadNote(
            String title,
            String unit,
            String fileName,
            String fileUrl,
            Long studentId,
            Long subjectId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found with ID: " + studentId));

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() ->
                        new RuntimeException("Subject not found with ID: " + subjectId));

        Note note = new Note();

        note.setTitle(title);
        note.setUnit(unit);
        note.setFileName(fileName);
        note.setFileUrl(fileUrl);
        note.setUploader(student);
        note.setSubject(subject);

        return noteRepository.save(note);
    }

    // GET ALL NOTES
    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    // GET NOTE BY ID
    public Note getNoteById(Long id) {
        return noteRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Note not found with ID: " + id));
    }

    // GET NOTES BY SUBJECT
    public List<Note> getNotesBySubject(Long subjectId) {

        if (!subjectRepository.existsById(subjectId)) {
            throw new RuntimeException(
                    "Subject not found with ID: " + subjectId);
        }

        return noteRepository.findBySubjectId(subjectId);
    }

    // GET NOTES BY SUBJECT AND UNIT
    public List<Note> getNotesBySubjectAndUnit(
            Long subjectId,
            String unit) {

        if (!subjectRepository.existsById(subjectId)) {
            throw new RuntimeException(
                    "Subject not found with ID: " + subjectId);
        }

        return noteRepository.findBySubjectIdAndUnit(
                subjectId,
                unit
        );
    }

    // GET NOTES UPLOADED BY STUDENT
    public List<Note> getNotesByStudent(Long studentId) {

        if (!studentRepository.existsById(studentId)) {
            throw new RuntimeException(
                    "Student not found with ID: " + studentId);
        }

        return noteRepository.findByUploaderId(studentId);
    }

    // DELETE NOTE
    public void deleteNote(Long id) {

        if (!noteRepository.existsById(id)) {
            throw new RuntimeException(
                    "Note not found with ID: " + id);
        }

        noteRepository.deleteById(id);
    }
}
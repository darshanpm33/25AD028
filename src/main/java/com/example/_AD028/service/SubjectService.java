package com.example._AD028.service;

import com.example._AD028.entity.Subject;
import com.example._AD028.repository.SubjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    public Subject createSubject(Subject subject) {
        return subjectRepository.save(subject);
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    public Subject getSubjectById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Subject not found with ID: " + id));
    }

    public Subject updateSubject(Long id, Subject updatedSubject) {

        Subject existingSubject = getSubjectById(id);

        existingSubject.setName(updatedSubject.getName());
        existingSubject.setCode(updatedSubject.getCode());

        return subjectRepository.save(existingSubject);
    }

    public void deleteSubject(Long id) {
        Subject existingSubject = getSubjectById(id);
        subjectRepository.delete(existingSubject);
    }
}
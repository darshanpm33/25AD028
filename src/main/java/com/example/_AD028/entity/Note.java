package com.example._AD028.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notes")
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String unit;

    private String fileName;

    private String fileUrl;

    private LocalDateTime uploadedAt;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student uploader;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    public Note() {
    }

    public Note(String title,
                String unit,
                String fileName,
                String fileUrl,
                Student uploader,
                Subject subject) {

        this.title = title;
        this.unit = unit;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.uploader = uploader;
        this.subject = subject;
        this.uploadedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public Student getUploader() {
        return uploader;
    }

    public void setUploader(Student uploader) {
        this.uploader = uploader;
    }

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }
}
/**
 * NoteShare Main Application Logic
 * Integrates API modules and UI components
 */

import { StudentAPI, SubjectAPI, NoteAPI, RatingAPI, CommentAPI, ApiService } from './api.js';
import { UI } from './ui.js';

class App {
    constructor() {
        this.state = {
            students: [],
            subjects: [],
            notes: [],
            currentStudentId: null,
            selectedSubjectId: 'ALL',
            selectedUnit: 'ALL',
            searchQuery: '',
            activeNoteDetails: null,
            activeTab: 'notes-view',
            isBackendConnected: false
        };

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.checkBackendHealth();
        await this.loadInitialData();
    }

    async checkBackendHealth() {
        const isOnline = await ApiService.checkHealth();
        this.state.isBackendConnected = isOnline;
        const statusPill = document.getElementById('backend-status');
        if (statusPill) {
            if (isOnline) {
                statusPill.className = 'status-pill status-online';
                statusPill.innerHTML = '<span class="pulse-dot"></span> Backend Connected';
            } else {
                statusPill.className = 'status-pill status-offline';
                statusPill.innerHTML = '<span class="pulse-dot"></span> Backend Offline (Check Spring Boot)';
            }
        }
    }

    async loadInitialData() {
        try {
            document.getElementById('notes-grid').innerHTML = UI.renderSkeletonCards(6);
            
            // Fetch students, subjects, and notes concurrently
            const [students, subjects, notes] = await Promise.all([
                StudentAPI.getAll().catch(() => []),
                SubjectAPI.getAll().catch(() => []),
                NoteAPI.getAll().catch(() => [])
            ]);

            this.state.students = students;
            this.state.subjects = subjects;
            this.state.notes = notes;

            // Restore active student from localStorage or pick first student
            const savedStudentId = localStorage.getItem('noteshare_active_student');
            if (savedStudentId && students.some(s => s.id == savedStudentId)) {
                this.state.currentStudentId = parseInt(savedStudentId);
            } else if (students.length > 0) {
                this.state.currentStudentId = students[0].id;
                localStorage.setItem('noteshare_active_student', students[0].id);
            }

            this.renderStudentSelector();
            this.renderSubjectFilterOptions();
            this.renderNotes();
            this.renderSubjectsList();
            this.renderStudentsList();
            this.updateStatsCounters();

        } catch (error) {
            console.error('Failed to load initial data:', error);
            UI.showToast('Could not load data from backend server. Make sure Spring Boot app is running on port 8080.', 'error', 'Connection Error');
            document.getElementById('notes-grid').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-server text-danger"></i>
                    <h3>Cannot Connect to Backend</h3>
                    <p>Make sure your Spring Boot backend service is running on <code>http://localhost:8080</code></p>
                    <button class="btn btn-primary mt-3" id="retry-connect-btn">
                        <i class="fas fa-sync-alt me-2"></i> Retry Connection
                    </button>
                </div>
            `;
            document.getElementById('retry-connect-btn')?.addEventListener('click', () => {
                this.init();
            });
        }
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.nav-link[data-tab]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = link.dataset.tab;
                this.switchTab(targetTab);
            });
        });

        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.state.searchQuery = e.target.value.toLowerCase().trim();
                this.renderNotes();
            });
        }

        // Subject filter dropdown
        const subjectFilter = document.getElementById('subject-filter');
        if (subjectFilter) {
            subjectFilter.addEventListener('change', (e) => {
                this.state.selectedSubjectId = e.target.value;
                this.updateUnitFilterOptions();
                this.renderNotes();
            });
        }

        // Unit filter dropdown
        const unitFilter = document.getElementById('unit-filter');
        if (unitFilter) {
            unitFilter.addEventListener('change', (e) => {
                this.state.selectedUnit = e.target.value;
                this.renderNotes();
            });
        }

        // Student switch dropdown
        const studentSelect = document.getElementById('current-student-select');
        if (studentSelect) {
            studentSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === 'NEW') {
                    UI.openModal('modal-add-student');
                    studentSelect.value = this.state.currentStudentId || '';
                } else {
                    this.state.currentStudentId = parseInt(val);
                    localStorage.setItem('noteshare_active_student', val);
                    const currentStudent = this.state.students.find(s => s.id == val);
                    UI.showToast(`Switched active profile to ${currentStudent ? currentStudent.name : 'Student'}`, 'info');
                }
            });
        }

        // Modals close triggers
        document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target === el) {
                    const modal = el.closest('.modal');
                    if (modal) UI.closeModal(modal.id);
                }
            });
        });

        // Open Modal buttons
        document.getElementById('btn-upload-note')?.addEventListener('click', () => {
            if (!this.state.currentStudentId) {
                UI.showToast('Please register or select a student profile first.', 'warning');
                UI.openModal('modal-add-student');
                return;
            }
            this.populateSubjectDropdownInUploadModal();
            UI.openModal('modal-upload-note');
        });

        document.getElementById('btn-add-subject')?.addEventListener('click', () => {
            UI.openModal('modal-add-subject');
        });

        document.getElementById('btn-add-student')?.addEventListener('click', () => {
            UI.openModal('modal-add-student');
        });

        // Forms submissions
        document.getElementById('form-upload-note')?.addEventListener('submit', (e) => this.handleUploadNote(e));
        document.getElementById('form-add-subject')?.addEventListener('submit', (e) => this.handleAddSubject(e));
        document.getElementById('form-add-student')?.addEventListener('submit', (e) => this.handleAddStudent(e));
        document.getElementById('form-add-comment')?.addEventListener('submit', (e) => this.handleAddComment(e));
    }

    switchTab(tabId) {
        this.state.activeTab = tabId;
        document.querySelectorAll('.nav-link[data-tab]').forEach(link => {
            if (link.dataset.tab === tabId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        document.querySelectorAll('.tab-content').forEach(section => {
            if (section.id === tabId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
    }

    renderStudentSelector() {
        const select = document.getElementById('current-student-select');
        if (!select) return;

        if (this.state.students.length === 0) {
            select.innerHTML = `<option value="">-- No Students Found --</option><option value="NEW">+ Register New Student</option>`;
            return;
        }

        select.innerHTML = this.state.students.map(s => 
            `<option value="${s.id}" ${s.id === this.state.currentStudentId ? 'selected' : ''}>👤 ${UI.escapeHtml(s.name)} (${UI.escapeHtml(s.email)})</option>`
        ).join('') + `<option value="NEW">+ Register New Student</option>`;
    }

    renderSubjectFilterOptions() {
        const select = document.getElementById('subject-filter');
        if (!select) return;

        select.innerHTML = `<option value="ALL">All Subjects</option>` +
            this.state.subjects.map(sub => 
                `<option value="${sub.id}">${UI.escapeHtml(sub.code)} - ${UI.escapeHtml(sub.name)}</option>`
            ).join('');

        this.updateUnitFilterOptions();
    }

    updateUnitFilterOptions() {
        const select = document.getElementById('unit-filter');
        if (!select) return;

        let filteredNotes = this.state.notes;
        if (this.state.selectedSubjectId !== 'ALL') {
            filteredNotes = filteredNotes.filter(n => n.subject && n.subject.id == this.state.selectedSubjectId);
        }

        const units = Array.from(new Set(filteredNotes.map(n => n.unit).filter(Boolean))).sort();

        select.innerHTML = `<option value="ALL">All Units</option>` +
            units.map(u => `<option value="${UI.escapeHtml(u)}">${UI.escapeHtml(u)}</option>`).join('');
    }

    populateSubjectDropdownInUploadModal() {
        const select = document.getElementById('upload-note-subject');
        if (!select) return;

        if (this.state.subjects.length === 0) {
            select.innerHTML = `<option value="">-- No subjects available, create one first --</option>`;
            return;
        }

        select.innerHTML = `<option value="">-- Select Subject --</option>` +
            this.state.subjects.map(sub => 
                `<option value="${sub.id}">${UI.escapeHtml(sub.code)} - ${UI.escapeHtml(sub.name)}</option>`
            ).join('');
    }

    renderNotes() {
        const grid = document.getElementById('notes-grid');
        if (!grid) return;

        let filtered = this.state.notes;

        // Subject filter
        if (this.state.selectedSubjectId !== 'ALL') {
            filtered = filtered.filter(n => n.subject && n.subject.id == this.state.selectedSubjectId);
        }

        // Unit filter
        if (this.state.selectedUnit !== 'ALL') {
            filtered = filtered.filter(n => n.unit === this.state.selectedUnit);
        }

        // Search Query
        if (this.state.searchQuery) {
            const q = this.state.searchQuery;
            filtered = filtered.filter(n => 
                (n.title && n.title.toLowerCase().includes(q)) ||
                (n.unit && n.unit.toLowerCase().includes(q)) ||
                (n.subject && (n.subject.name.toLowerCase().includes(q) || n.subject.code.toLowerCase().includes(q))) ||
                (n.uploader && n.uploader.name.toLowerCase().includes(q))
            );
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>No Notes Found</h3>
                    <p>No study materials match your current filter or search criteria.</p>
                    <button class="btn btn-primary mt-3" id="empty-upload-btn">
                        <i class="fas fa-upload me-2"></i> Upload First Note
                    </button>
                </div>
            `;
            document.getElementById('empty-upload-btn')?.addEventListener('click', () => {
                document.getElementById('btn-upload-note')?.click();
            });
            return;
        }

        grid.innerHTML = filtered.map(note => this.createNoteCardHtml(note)).join('');

        // Attach card click handlers for details view and delete
        grid.querySelectorAll('.card-note').forEach(card => {
            const noteId = card.dataset.noteId;
            card.querySelector('.btn-view-note')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openNoteDetailsModal(noteId);
            });
            card.querySelector('.btn-delete-note')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.confirmDeleteNote(noteId);
            });
        });
    }

    createNoteCardHtml(note) {
        const subjectCode = note.subject ? note.subject.code : 'GEN';
        const subjectName = note.subject ? note.subject.name : 'General Subject';
        const uploaderName = note.uploader ? note.uploader.name : 'Anonymous Student';
        const isOwner = note.uploader && note.uploader.id === this.state.currentStudentId;

        return `
            <div class="card card-note" data-note-id="${note.id}">
                <div class="card-header-badge">
                    <span class="badge badge-subject">${UI.escapeHtml(subjectCode)}</span>
                    <span class="badge badge-unit">${UI.escapeHtml(note.unit || 'Unit 1')}</span>
                </div>
                <h3 class="note-title">${UI.escapeHtml(note.title)}</h3>
                <p class="note-subject-name">${UI.escapeHtml(subjectName)}</p>
                
                <div class="note-meta">
                    <div class="uploader-info">
                        <div class="avatar-sm">${UI.getInitials(uploaderName)}</div>
                        <span>${UI.escapeHtml(uploaderName)}</span>
                    </div>
                    <span class="upload-date"><i class="far fa-clock"></i> ${UI.formatDate(note.uploadedAt)}</span>
                </div>

                <div class="card-actions">
                    <button class="btn btn-outline btn-view-note">
                        <i class="fas fa-eye me-1"></i> View Details
                    </button>
                    ${note.fileUrl ? `
                        <a href="${UI.escapeHtml(note.fileUrl)}" target="_blank" class="btn btn-primary" download>
                            <i class="fas fa-download"></i>
                        </a>
                    ` : ''}
                    ${isOwner ? `
                        <button class="btn btn-danger-icon btn-delete-note" title="Delete Note">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderSubjectsList() {
        const grid = document.getElementById('subjects-grid');
        if (!grid) return;

        if (this.state.subjects.length === 0) {
            grid.innerHTML = `<div class="empty-state"><i class="fas fa-book"></i><h3>No Subjects Added</h3><p>Create a subject to categorize uploaded notes.</p></div>`;
            return;
        }

        grid.innerHTML = this.state.subjects.map(sub => {
            const count = this.state.notes.filter(n => n.subject && n.subject.id === sub.id).length;
            return `
                <div class="card subject-card">
                    <div class="subject-icon"><i class="fas fa-book-open"></i></div>
                    <div class="subject-info">
                        <h4>${UI.escapeHtml(sub.name)}</h4>
                        <div class="subject-code-badge">${UI.escapeHtml(sub.code)}</div>
                        <p class="notes-count">${count} Notes available</p>
                    </div>
                    <button class="btn btn-sm btn-outline filter-by-sub-btn" data-subject-id="${sub.id}">
                        View Notes
                    </button>
                </div>
            `;
        }).join('');

        grid.querySelectorAll('.filter-by-sub-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const subId = btn.dataset.subjectId;
                this.state.selectedSubjectId = subId;
                document.getElementById('subject-filter').value = subId;
                this.switchTab('notes-view');
                this.renderNotes();
            });
        });
    }

    renderStudentsList() {
        const container = document.getElementById('students-grid');
        if (!container) return;

        if (this.state.students.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-user-graduate"></i><h3>No Students Registered</h3><p>Register student profiles to start sharing notes.</p></div>`;
            return;
        }

        container.innerHTML = this.state.students.map(st => {
            const notesCount = this.state.notes.filter(n => n.uploader && n.uploader.id === st.id).length;
            const isCurrent = st.id === this.state.currentStudentId;
            return `
                <div class="card student-card ${isCurrent ? 'active-profile-card' : ''}">
                    <div class="avatar-lg">${UI.getInitials(st.name)}</div>
                    <h4>${UI.escapeHtml(st.name)} ${isCurrent ? '<span class="badge badge-success">Active Profile</span>' : ''}</h4>
                    <p class="student-email"><i class="far fa-envelope"></i> ${UI.escapeHtml(st.email)}</p>
                    <div class="student-stats">
                        <span><i class="fas fa-file-alt text-primary"></i> ${notesCount} Uploads</span>
                    </div>
                    <button class="btn btn-sm ${isCurrent ? 'btn-secondary' : 'btn-outline'} select-student-btn" data-student-id="${st.id}">
                        ${isCurrent ? 'Currently Active' : 'Switch to Profile'}
                    </button>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.select-student-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const stId = parseInt(btn.dataset.studentId);
                this.state.currentStudentId = stId;
                localStorage.setItem('noteshare_active_student', stId);
                this.renderStudentSelector();
                this.renderStudentsList();
                this.renderNotes();
                UI.showToast(`Switched active profile`, 'info');
            });
        });
    }

    updateStatsCounters() {
        document.getElementById('stat-total-notes').textContent = this.state.notes.length;
        document.getElementById('stat-total-subjects').textContent = this.state.subjects.length;
        document.getElementById('stat-total-students').textContent = this.state.students.length;
    }

    // Modal & Action Handlers
    async openNoteDetailsModal(noteId) {
        try {
            const note = await NoteAPI.getById(noteId);
            this.state.activeNoteDetails = note;

            // Fetch Ratings & Comments for this note
            const [ratings, comments] = await Promise.all([
                RatingAPI.getByNote(noteId).catch(() => []),
                CommentAPI.getByNote(noteId).catch(() => [])
            ]);

            const modalBody = document.getElementById('note-details-content');
            
            // Calculate Average Rating
            let avgRating = 0;
            if (ratings.length > 0) {
                avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
            }

            modalBody.innerHTML = `
                <div class="note-detail-header">
                    <span class="badge badge-subject">${UI.escapeHtml(note.subject ? note.subject.code : '')}</span>
                    <span class="badge badge-unit">${UI.escapeHtml(note.unit || '')}</span>
                    <h2>${UI.escapeHtml(note.title)}</h2>
                    <p class="text-muted">${UI.escapeHtml(note.subject ? note.subject.name : '')}</p>
                </div>

                <div class="note-detail-info-bar">
                    <div>
                        <strong>Uploader:</strong> ${UI.escapeHtml(note.uploader ? note.uploader.name : 'Unknown')}
                    </div>
                    <div>
                        <strong>Uploaded:</strong> ${UI.formatDate(note.uploadedAt)}
                    </div>
                    <div>
                        <strong>File:</strong> ${UI.escapeHtml(note.fileName || 'Document.pdf')}
                    </div>
                </div>

                <div class="rating-summary-box">
                    <div class="rating-visual">
                        ${UI.renderStars(avgRating, ratings.length)}
                    </div>
                    <div class="add-rating-controls">
                        <span>Rate this note:</span>
                        <div class="star-picker" id="star-picker">
                            ${[1, 2, 3, 4, 5].map(star => `
                                <i class="far fa-star star-btn" data-rating="${star}"></i>
                            `).join('')}
                        </div>
                    </div>
                </div>

                ${note.fileUrl ? `
                    <div class="note-file-preview-box">
                        <i class="fas fa-file-pdf fa-3x text-danger"></i>
                        <div class="flex-grow-1">
                            <h5>${UI.escapeHtml(note.fileName || 'Note Document')}</h5>
                            <a href="${UI.escapeHtml(note.fileUrl)}" target="_blank" class="text-primary">Click to view file link</a>
                        </div>
                        <a href="${UI.escapeHtml(note.fileUrl)}" target="_blank" download class="btn btn-primary">
                            <i class="fas fa-external-link-alt me-1"></i> Open File
                        </a>
                    </div>
                ` : ''}

                <div class="comments-section">
                    <h4><i class="far fa-comments me-2"></i> Comments & Feedback (${comments.length})</h4>
                    
                    <div class="comments-list" id="comments-list">
                        ${comments.length === 0 ? '<p class="text-muted text-center py-3">No comments yet. Be the first to leave feedback!</p>' : 
                            comments.map(c => `
                                <div class="comment-item">
                                    <div class="avatar-sm">${UI.getInitials(c.student ? c.student.name : 'S')}</div>
                                    <div class="comment-content">
                                        <div class="comment-header">
                                            <strong>${UI.escapeHtml(c.student ? c.student.name : 'Student')}</strong>
                                            <span class="comment-time">${UI.formatDate(c.createdAt)}</span>
                                        </div>
                                        <p>${UI.escapeHtml(c.content)}</p>
                                    </div>
                                    ${(c.student && c.student.id === this.state.currentStudentId) ? `
                                        <button class="btn-delete-comment" data-comment-id="${c.id}">&times;</button>
                                    ` : ''}
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            `;

            // Star rating picker interactive behavior
            const starBtns = modalBody.querySelectorAll('.star-btn');
            starBtns.forEach(star => {
                star.addEventListener('mouseover', () => {
                    const val = parseInt(star.dataset.rating);
                    starBtns.forEach((s, idx) => {
                        s.className = idx < val ? 'fas fa-star star-btn text-warning' : 'far fa-star star-btn';
                    });
                });

                star.addEventListener('mouseleave', () => {
                    starBtns.forEach(s => s.className = 'far fa-star star-btn');
                });

                star.addEventListener('click', async () => {
                    const val = parseInt(star.dataset.rating);
                    await this.submitRating(note.id, val);
                });
            });

            // Comment deletion listeners
            modalBody.querySelectorAll('.btn-delete-comment').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const commentId = btn.dataset.commentId;
                    try {
                        await CommentAPI.delete(commentId);
                        UI.showToast('Comment deleted', 'info');
                        this.openNoteDetailsModal(note.id); // Refresh modal content
                    } catch (err) {
                        UI.showToast('Failed to delete comment', 'error');
                    }
                });
            });

            UI.openModal('modal-note-details');

        } catch (error) {
            console.error('Error fetching note details:', error);
            UI.showToast('Failed to load note details', 'error');
        }
    }

    async submitRating(noteId, ratingValue) {
        if (!this.state.currentStudentId) {
            UI.showToast('Please select a student profile before rating!', 'warning');
            return;
        }

        try {
            await RatingAPI.create({
                rating: ratingValue,
                studentId: this.state.currentStudentId,
                noteId: noteId
            });
            UI.showToast(`Rated ${ratingValue} stars!`, 'success');
            this.openNoteDetailsModal(noteId); // refresh modal ratings
        } catch (error) {
            UI.showToast(error.message || 'You might have already rated this note!', 'warning');
        }
    }

    async handleAddComment(e) {
        e.preventDefault();
        const contentInput = document.getElementById('comment-input');
        const content = contentInput.value.trim();

        if (!content) return;

        if (!this.state.currentStudentId) {
            UI.showToast('Please select or register a student profile first!', 'warning');
            return;
        }

        if (!this.state.activeNoteDetails) return;

        try {
            await CommentAPI.create({
                content: content,
                studentId: this.state.currentStudentId,
                noteId: this.state.activeNoteDetails.id
            });
            contentInput.value = '';
            UI.showToast('Comment added successfully!', 'success');
            this.openNoteDetailsModal(this.state.activeNoteDetails.id); // Refresh modal view
        } catch (error) {
            UI.showToast(error.message || 'Failed to post comment', 'error');
        }
    }

    async handleUploadNote(e) {
        e.preventDefault();
        const title = document.getElementById('upload-note-title').value.trim();
        const subjectId = document.getElementById('upload-note-subject').value;
        const unit = document.getElementById('upload-note-unit').value.trim();
        const fileName = document.getElementById('upload-note-filename').value.trim();
        const fileUrl = document.getElementById('upload-note-fileurl').value.trim();

        if (!title || !subjectId || !unit) {
            UI.showToast('Please fill in all required fields.', 'warning');
            return;
        }

        try {
            const newNote = await NoteAPI.create({
                title: title,
                unit: unit,
                fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
                fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                studentId: this.state.currentStudentId,
                subjectId: parseInt(subjectId)
            });

            UI.showToast('Note uploaded successfully!', 'success');
            UI.closeModal('modal-upload-note');
            document.getElementById('form-upload-note').reset();
            
            await this.loadInitialData(); // Reload updated list
        } catch (error) {
            UI.showToast(error.message || 'Failed to upload note', 'error');
        }
    }

    async handleAddSubject(e) {
        e.preventDefault();
        const name = document.getElementById('add-subject-name').value.trim();
        const code = document.getElementById('add-subject-code').value.trim().toUpperCase();

        if (!name || !code) {
            UI.showToast('Please enter both subject name and code.', 'warning');
            return;
        }

        try {
            await SubjectAPI.create({ name, code });
            UI.showToast(`Subject ${code} created successfully!`, 'success');
            UI.closeModal('modal-add-subject');
            document.getElementById('form-add-subject').reset();

            await this.loadInitialData();
        } catch (error) {
            UI.showToast(error.message || 'Failed to add subject. Code might be duplicate.', 'error');
        }
    }

    async handleAddStudent(e) {
        e.preventDefault();
        const name = document.getElementById('add-student-name').value.trim();
        const email = document.getElementById('add-student-email').value.trim();
        const password = document.getElementById('add-student-password').value.trim() || 'password123';

        if (!name || !email) {
            UI.showToast('Please enter student name and email.', 'warning');
            return;
        }

        try {
            const newStudent = await StudentAPI.create({ name, email, password });
            UI.showToast(`Student ${name} registered!`, 'success');
            UI.closeModal('modal-add-student');
            document.getElementById('form-add-student').reset();

            // Set as active profile
            this.state.currentStudentId = newStudent.id;
            localStorage.setItem('noteshare_active_student', newStudent.id);

            await this.loadInitialData();
        } catch (error) {
            UI.showToast(error.message || 'Failed to register student. Email may already exist.', 'error');
        }
    }

    async confirmDeleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            try {
                await NoteAPI.delete(noteId);
                UI.showToast('Note deleted successfully', 'info');
                await this.loadInitialData();
            } catch (error) {
                UI.showToast(error.message || 'Failed to delete note', 'error');
            }
        }
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

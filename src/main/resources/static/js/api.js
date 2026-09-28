/**
 * NoteShare API Service Client
 * Connects to Spring Boot REST Endpoints
 */

const API_BASE_URL = (window.location.origin.includes('http://') || window.location.origin.includes('https://')) && !window.location.origin.includes(':5500') && !window.location.origin.includes(':3000') && !window.location.origin.includes('127.0.0.1:5500')
    ? `${window.location.origin}/api`
    : 'http://localhost:8080/api';

class ApiService {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(options.headers || {})
        };

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                let errorMessage = `HTTP Error ${response.status}`;
                try {
                    const errorJson = await response.json();
                    errorMessage = errorJson.message || errorJson.error || errorMessage;
                } catch (e) {
                    const errorText = await response.text();
                    if (errorText) errorMessage = errorText;
                }
                throw new Error(errorMessage);
            }

            // Return text response for DELETE or empty response body
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, error);
            throw error;
        }
    }

    static async checkHealth() {
        try {
            await fetch(`${API_BASE_URL}/subjects`, { method: 'GET' });
            return true;
        } catch (e) {
            return false;
        }
    }
}

// Students API
export const StudentAPI = {
    getAll: () => ApiService.request('/students'),
    getById: (id) => ApiService.request(`/students/${id}`),
    create: (student) => ApiService.request('/students', {
        method: 'POST',
        body: JSON.stringify(student)
    }),
    update: (id, student) => ApiService.request(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(student)
    }),
    delete: (id) => ApiService.request(`/students/${id}`, {
        method: 'DELETE'
    })
};

// Subjects API
export const SubjectAPI = {
    getAll: () => ApiService.request('/subjects'),
    getById: (id) => ApiService.request(`/subjects/${id}`),
    create: (subject) => ApiService.request('/subjects', {
        method: 'POST',
        body: JSON.stringify(subject)
    }),
    update: (id, subject) => ApiService.request(`/subjects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(subject)
    }),
    delete: (id) => ApiService.request(`/subjects/${id}`, {
        method: 'DELETE'
    })
};

// Notes API
export const NoteAPI = {
    getAll: () => ApiService.request('/notes'),
    getById: (id) => ApiService.request(`/notes/${id}`),
    getBySubject: (subjectId) => ApiService.request(`/notes/subject/${subjectId}`),
    getBySubjectAndUnit: (subjectId, unit) => ApiService.request(`/notes/subject/${subjectId}/unit/${encodeURIComponent(unit)}`),
    getByStudent: (studentId) => ApiService.request(`/notes/student/${studentId}`),
    create: (noteRequest) => ApiService.request('/notes', {
        method: 'POST',
        body: JSON.stringify(noteRequest)
    }),
    delete: (id) => ApiService.request(`/notes/${id}`, {
        method: 'DELETE'
    })
};

// Ratings API
export const RatingAPI = {
    getAll: () => ApiService.request('/ratings'),
    getById: (id) => ApiService.request(`/ratings/${id}`),
    getByNote: (noteId) => ApiService.request(`/ratings/note/${noteId}`),
    getByStudent: (studentId) => ApiService.request(`/ratings/student/${studentId}`),
    create: (ratingRequest) => ApiService.request('/ratings', {
        method: 'POST',
        body: JSON.stringify(ratingRequest)
    }),
    delete: (id) => ApiService.request(`/ratings/${id}`, {
        method: 'DELETE'
    })
};

// Comments API
export const CommentAPI = {
    getAll: () => ApiService.request('/comments'),
    getById: (id) => ApiService.request(`/comments/${id}`),
    getByNote: (noteId) => ApiService.request(`/comments/note/${noteId}`),
    getByStudent: (studentId) => ApiService.request(`/comments/student/${studentId}`),
    create: (commentRequest) => ApiService.request('/comments', {
        method: 'POST',
        body: JSON.stringify(commentRequest)
    }),
    delete: (id) => ApiService.request(`/comments/${id}`, {
        method: 'DELETE'
    })
};

export { ApiService, API_BASE_URL };

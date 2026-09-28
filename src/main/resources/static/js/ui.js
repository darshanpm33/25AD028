/**
 * NoteShare UI Helper Utilities & Components
 */

export class UI {
    // Toast notification manager
    static showToast(message, type = 'info', title = '') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} animate-slide-in`;
        toast.innerHTML = `
            <div class="toast-icon"><i class="fas ${icons[type] || icons.info}"></i></div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${this.escapeHtml(title)}</div>` : ''}
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        container.appendChild(toast);

        // Auto removal after 4s
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Modal Manager
    static openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    static closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Escape HTML to prevent XSS
    static escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Format LocalDateTime string into user friendly format
    static formatDate(dateString) {
        if (!dateString) return 'Just now';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    }

    // Render Star Rating HTML
    static renderStars(rating, count = null) {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        let starsHtml = '';

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                starsHtml += `<i class="fas fa-star text-warning"></i>`;
            } else if (i === fullStars + 1 && hasHalf) {
                starsHtml += `<i class="fas fa-star-half-alt text-warning"></i>`;
            } else {
                starsHtml += `<i class="far fa-star text-muted"></i>`;
            }
        }

        const countText = count !== null ? `<span class="rating-count">(${count})</span>` : '';
        return `<div class="star-rating" title="${rating.toFixed(1)} / 5">${starsHtml} <span class="rating-score">${rating.toFixed(1)}</span> ${countText}</div>`;
    }

    // Get Avatar initials for user
    static getInitials(name) {
        if (!name) return 'ST';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    // Skeleton loader component
    static renderSkeletonCards(count = 4) {
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="card skeleton-card">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-badge"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-button"></div>
                </div>
            `;
        }
        return html;
    }
}

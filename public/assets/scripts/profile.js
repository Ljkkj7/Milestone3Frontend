import {
    parseJwt,
} from './profilePayLoad.js';

const postButton = document.getElementById('postCommentButton');

postButton.addEventListener('click', async (e) => {
    const commentInput = document.getElementById('commentInput');
    const comment = commentInput.value.trim();
    const targetUserId = getUserIdFromUrl();

    if (!comment || !targetUserId) {
        return;
    }

    const data = await callCommentsAPI('POST_COMMENT', { content: comment, target_user: targetUserId });
    if (data) {
        appendComment(data);
        commentInput.value = ''; // Clear the input field
    }

    else {
        alert('Failed to post comment. Please try again.');
    }
});

function getUserIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('user'); // returns null if not present
}

function appendComment(comment) {
    const container = document.getElementById('commentPosts');

    const div = document.createElement('div');
    div.classList.add('comment');

    const token = localStorage.getItem('access_token');

    div.innerHTML = `
        <div class="comment-item">
            <a href="profile.html?user=${comment.author_id}" class="comment-author-link">
                <img src="${comment.author_avatar || 'assets/images/profile.png'}" alt="${sanitize(comment.author_username)}'s avatar" class="comment-avatar">
                <p><strong>${sanitize(comment.author_username)}</strong></p>
            </a>
            <p>${sanitize(comment.content)}</p>
            <small>${new Date(comment.created_at).toLocaleString({
                hour: '2-digit',
                minute: '2-digit',
            })}</small>
        </div>
    `;

    if (token) {
        const userData = parseJwt(token);
        // You can use userData to customize the comment display

        if (userData.user_id === comment.author_id) {
            div.innerHTML += `
                <button class="delete-comment" id="del${comment.id}">Delete</button>
                <button class="edit-comment" id="edit${comment.id}">Edit</button>
            `;
        }
    }

    container.prepend(div); // Add new comments at the top
}

async function loadComments() {
    const data = await callCommentsAPI('LOAD_COMMENTS');
    const container = document.getElementById('commentPosts');
    container.innerHTML = ''; // Clear existing comments

    data.forEach(comment => {
        appendComment(comment);
    });
}

async function callCommentsAPI(type, payload = {}) {
    const targetUserId = getUserIdFromUrl();
    const token = localStorage.getItem('access_token');

    if (!targetUserId || !token) return;

    const baseUrl = 'https://marketio-3cedad1469b3.herokuapp.com/comments/';

    try {
        if (type === 'LOAD_COMMENTS') {
            const res = await fetch(`${baseUrl}?target_user=${targetUserId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error(`GET failed: ${res.status}`);
            return await res.json();
        }

        if (type === 'POST_COMMENT') {
            const res = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(`POST failed: ${res.status}`);
            return await res.json();
        }

    } catch (error) {
        console.error('API error:', error);
    }
}


// Simple sanitization to prevent XSS
function sanitize(str) {
    // Create a temporary element to escape HTML
    const temp = document.createElement('div');
    // Set the text content to the string, which will escape HTML
    temp.textContent = str;
    // Return the inner HTML, which is now safe
    return temp.innerHTML;
}

async function callStatsAPI() {

}

async function loadProfileData() {
}

// Load comments when the page is ready
document.addEventListener('DOMContentLoaded', () => {
    loadComments();
});
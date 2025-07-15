const postButton = document.getElementById('postCommentButton');

postButton.addEventListener('click', async (e) => {
    const commentInput = document.getElementById('commentInput');
    const comment = commentInput.value.trim();
    const targetUserId = getUserIdFromUrl();

    if (!comment || !targetUserId) {
        return;
    }

    try {
        const token = localStorage.getItem('access_token');

        if (!token) {
            alert('You must be logged in to post a comment.');
            return;
        }

        const response = await fetch(`https://marketio-3cedad1469b3.herokuapp.com/comments/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                content: comment,
                target_user: targetUserId
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Error posting comment: ${errorData.detail || 'Unknown error'}`);
            return;
        }

        const data = await response.json();
        appendComment(data);
        commentInput.value = ''; // Clear the input field

    } catch (error) {
        console.error('Error posting comment:', error);
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

    div.innerHTML = `
        <div class="comment-item">
            <p><strong>${sanitize(comment.author_username)}</strong>:</p>
            <p>${sanitize(comment.content)}</p>
            <small>${new Date(comment.created_at).toLocaleString()}</small>
        </div>
    `;

    container.prepend(div); // Add new comments at the top
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
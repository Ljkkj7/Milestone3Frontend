import {
    parseJwt,
} from './profilePayLoad.js';

import {
    loadDashboardData,
} from './dashboard.js';

import {
    createStockChart,
    updateStockChart
} from './stockChart.js';

const postButton = document.getElementById('postCommentButton');
const renderedStocks = new Set(); // To track rendered stocks
const socket = io.connect();
const stockCharts = {};

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

export function getUserIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('user'); // returns null if not present
}

function appendComment(comment) {
    const container = document.getElementById('commentPosts');

    const div = document.createElement('div');
    div.classList.add('comment');

    const token = localStorage.getItem('access_token');

    if (token) {
        const userData = parseJwt(token);
        // You can use userData to customize the comment display

        div.innerHTML = `
        <div class="comment-item">
            <a href="profile.html?user=${comment.author_id}" class="comment-author-link">
                <img src="${comment.author_avatar || 'assets/images/profile.png'}" alt="${sanitize(comment.author_username)}'s avatar" class="comment-avatar">
                <p><strong>${sanitize(comment.author_username)}</strong></p>
            </a>
            <p class="comment-body">${sanitize(comment.content)}</p>
            <small>${new Date(comment.created_at).toLocaleString({
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: 'none',
            })}</small>
        </div>
        `;

        if (userData.user_id === comment.author_id || userData.user_id === Number(getUserIdFromUrl())) {
            console.log(userData.user_id, comment.author_id, getUserIdFromUrl());
            div.innerHTML += `
                <button class="CRUD-comment" data-comment-id="del${comment.id}">Delete</button>
                <button class="CRUD-comment" data-comment-id="edit${comment.id}">Edit</button>
            `;
        }
    }

    container.append(div); // Add new comments at the top - comments API feeds objects in from most recent ID first
}

async function loadComments() {
    const data = await callCommentsAPI('LOAD_COMMENTS');
    const container = document.getElementById('commentPosts');
    container.innerHTML = ''; // Clear existing comments

    console.log('Loaded comments:', data);
    data.forEach(comment => {
        console.log('Appending comment:', comment);
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

async function loadProfileData(type) {
    const token = localStorage.getItem('access_token');
    let userData = {};
    const jwtUserId = parseJwt(token)?.user_id;
    if (!token) return;

    if (jwtUserId === getUserIdFromUrl()) {
        userData = await loadDashboardData('USER_DATA');
    } else {
        userData = await loadDashboardData('TARGET_USER_DATA');
    }
    const portfolioData = await loadDashboardData('PORTFOLIO_DATA');

    if (type === 'USER_DATA') return userData;
    if (type === 'PORTFOLIO_DATA') return portfolioData;
}

async function setProfileStocks() {
    const portfolioData = await loadDashboardData('PORTFOLIO_DATA');
    const container = document.getElementById('stockCards');
    let priceHistory = JSON.parse(localStorage.getItem('priceHistory')) || {};
    let labelHistory = JSON.parse(localStorage.getItem('labelHistory')) || {};

    container.innerHTML = ''; // Clear existing stocks
    console.log('Portfolio data:', portfolioData);
    portfolioData.details.forEach(stock => {

        const { symbol, quantity, price, value } = stock;

        console.log('Processing stock:', symbol, quantity, price, value);

        const numPrice = parseFloat(price).toFixed(2);
        const label = new Date().toLocaleDateString();

        if (!renderedStocks.has(symbol)) {

            const stockCard = document.createElement('div');
            stockCard.className = 'stock-card';
            stockCard.innerHTML = `
                <div class="stock-title">${symbol}</div>
                <a href="stock-detail.html?symbol=${symbol}" class="stock-link">
                    <div class="stock-price" id="price-${symbol}">£${numPrice}</div>
                    <canvas id="chart-${symbol}" width="400" height="200"></canvas>
                </a>
            `;
            container.appendChild(stockCard);
            renderedStocks.add(symbol); // Add to rendered stocks set

            const stockCtx = document.getElementById(`chart-${symbol}`).getContext('2d');
            stockCharts[symbol] = createStockChart(stockCtx, symbol);
            stockCharts[symbol].data.labels = labelHistory[symbol] || [];
            stockCharts[symbol].data.datasets[0].data = priceHistory[symbol] || [];
            stockCharts[symbol].update();
        } else if (renderedStocks.has(symbol)) {
            updateStockChart(
                stockCharts[symbol],
                label,
                numPrice
            );
        }
    });
}

// Load comments when the page is ready
document.addEventListener('DOMContentLoaded', () => {
    loadComments();
});

socket.on('connect', () => {
    console.log('Connected to WebSocket');
    loadProfileData('USER_DATA').then(userData => {
        document.getElementById('profileUsername').textContent = userData.username;
        document.getElementById('profileUserStocks').textContent = userData.username;
    });
});

socket.on('stocks_data', () => {
    setProfileStocks();
});


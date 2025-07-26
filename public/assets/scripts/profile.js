import {
    parseJwt,
} from './profilePayLoad.js';

import {
    callAPIs
} from './apiCalls.js';

import {
    createStockChart,
    updateStockChart
} from './stockChart.js';

const postButton = document.getElementById('postCommentButton');
const renderedStocks = new Set(); // To track rendered stocks
const socket = io.connect();
const stockCharts = {};
const token = localStorage.getItem('access_token');
const jwtUserId = parseJwt(token)?.user_id;
let priceHistory = JSON.parse(localStorage.getItem('priceHistory')) || {};
let labelHistory = JSON.parse(localStorage.getItem('labelHistory')) || {};

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
            <p class="comment-body" data-comment-id="${comment.id}">${sanitize(comment.content)}</p>
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

// Handle delete and edit actions
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('CRUD-comment')) {
        const dataId = e.target.getAttribute('data-comment-id');
        
        if (dataId.startsWith('del')) {
            const commentId = dataId.replace('del', '');
            handleDeleteComment(commentId);
        } else if (dataId.startsWith('edit')) {
            const commentId = dataId.replace('edit', '');
            handleEditComment(commentId);
        }
    }
});

// Function to handle editing a comment
async function handleEditComment(commentId) {
    const newContent = prompt("Edit your comment:");
    if (!newContent) return;

    try {
        const data = await callCommentsAPI('EDIT_COMMENT', { commentId, content: newContent });
        if (data) {
            const commentElement = document.querySelector(`.comment-body[data-comment-id="${commentId}"]`);
            const commentDateElement = commentElement.nextElementSibling;
            const commentDate = new Date(data.updated_at).toLocaleString({
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: 'none',
            });
            commentElement.textContent = sanitize(newContent);
            commentDateElement.textContent = commentDate;
        } else {
            alert('Failed to edit comment. Please try again.');
        }
    } catch (error) {
        console.error('Error editing comment:', error);
    }
}

// Function to handle deleting a comment
async function handleDeleteComment(commentId) {
    const confirmation = confirm("Are you sure you want to delete this comment?");
    if (!confirmation) return;
    try {
        const data = await callCommentsAPI('DELETE_COMMENT', { commentId });
        if (data) {
            document.querySelector(`.comment-body[data-comment-id="${commentId}"]`).closest('.comment').remove();
        } else {
            alert('Failed to delete comment. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
    }
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

        if (type === 'DELETE_COMMENT') {
            const commentId = payload.commentId;
            const res = await fetch(`${baseUrl}${commentId}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.status === 204) {
                return true; // Successfully deleted
            }
            if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
            return await res.json();
        }

        if (type === 'EDIT_COMMENT') {
            const commentId = payload.commentId;
            const res = await fetch(`${baseUrl}${commentId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(`EDIT failed: ${res.status}`);
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

async function loadProfileData() {
    const token = localStorage.getItem('access_token');
    let userData = {};
    let portfolioData = {};
    if (!token) return;

    if (jwtUserId === getUserIdFromUrl()) {
        userData = await callAPIs('USER_DATA');
        portfolioData = await callAPIs('PORTFOLIO_DATA');
    } else {
        userData = await callAPIs('TARGET_USER_DATA');
        portfolioData = await callAPIs('TARGET_PORTFOLIO_DATA');
    }

    return { portfolioData, userData };
}

async function setProfileStocks() {
    const token = localStorage.getItem('access_token');
    const userId = parseJwt(token)?.user_id;
    const targetUserId = getUserIdFromUrl();
    let portfolioData = {};
    if (!token || !userId || !targetUserId) {
        console.error('Missing token or user ID');
        return;
    }

    if (userId !== Number(targetUserId)) {
        portfolioData = await callAPIs('TARGET_USER_PORTFOLIO_DATA');
    } else {
        portfolioData = await callAPIs('PORTFOLIO_DATA');
    }
    
    const container = document.getElementById('stockCards');

    container.innerHTML = ''; // Clear existing stocks
    console.log('Portfolio data:', portfolioData);
    portfolioData.details.forEach(stock => {

        const { symbol, quantity, current_price, value } = stock;

        console.log('Processing stock:', symbol, quantity, current_price, value);

        const numPrice = parseFloat(current_price).toFixed(2);
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
        } else {
            console.log(`Updating existing chart for symbol: ${symbol}, price: £${numPrice}, label: ${label}`);
            updateStockChart(
                stockCharts[symbol],
                label,
                numPrice
            )};
    });
}

async function loadTopThreeTrades() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (jwtUserId !== getUserIdFromUrl()) {
        return await callAPIs('TARGET_USER_TOP_STOCKS_DATA');
    }
    return await callAPIs('USER_TOP_STOCKS_DATA');
}

async function setTopThreeTrades() {
    const res = await loadTopThreeTrades();
    const trades = res.top_stocks || [];

    const container = document.getElementById('topTradesList');
    container.innerHTML = ''; // Clear existing trades

    console.log('Top trades data:', trades);
    if (trades.length === 0) {
        container.innerHTML = '<p>No trades available.</p>';
        return;
    }

    trades.forEach((trade, index) => {
        if (index > 2) return; // Limit to top 3 trades
        const { symbol, profit_loss: profit } = trade;
        const tradeElement = document.createElement('div');
        tradeElement.className = 'trade-card';
        tradeElement.id = `trade-${index}`;
        tradeElement.innerHTML = `
            <div class="trade-title">${symbol}</div>
            <div class="trade-details">
                <span class="trade-profit">Profit: £${profit.toFixed(2)}</span>
            </div>
        `;
        container.appendChild(tradeElement);
    });

    const tradeCards = document.querySelectorAll('.trade-card');
    tradeCards.forEach(card => {
        if (card.id === 'trade-0') {
            card.classList.add('top-trade');
        }
        if (card.id === 'trade-1') {
            card.classList.add('second-trade');
        }
        if (card.id === 'trade-2') {
            card.classList.add('third-trade');
        }
    });
}

// Load comments when the page is ready
document.addEventListener('DOMContentLoaded', async () => {
    loadComments();
    const { portfolioData, userData } = await loadProfileData();
    document.getElementById('profileUserStocks').textContent = userData.username;
    document.getElementById('profileUsername').textContent = userData.username;
    document.getElementById('profileLevel').textContent = userData.level;
    document.getElementById('profileExperience').textContent = userData.experience;
    document.getElementById('profileBalance').textContent = `£${(parseFloat(userData.balance) + parseFloat(portfolioData.total_portfolio_value)).toFixed(2)}`;
    setProfileStocks();
    setTopThreeTrades();
});

socket.on('stocks_data', (stocks) => {
    stocks.forEach(stock => {
        const {symbol, price} = stock;
        const numPrice = parseFloat(price)
        const label = new Date().toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        if (!symbol || !price) {
            console.warn(`Invalid stock data received: ${JSON.stringify(stock)}`);
            return; // Skip this stock if data is invalid
        }

        if (!priceHistory[symbol]) priceHistory[symbol] = [];
        if (!labelHistory[symbol]) labelHistory[symbol] = [];

        priceHistory[symbol].push(numPrice);
        labelHistory[symbol].push(label);

        if (priceHistory[symbol].length > 20) {
            //Code to delete bloated pricehistory arrays from testing
            while(priceHistory[symbol].length > 21){
                priceHistory[symbol].shift()
            }
            priceHistory[symbol].shift();
            labelHistory[symbol].shift();
        }

        localStorage.setItem('priceHistory', JSON.stringify(priceHistory));
        localStorage.setItem('labelHistory', JSON.stringify(labelHistory));

        if(renderedStocks.has(symbol)){
            updateStockChart(stockCharts[symbol], label, numPrice)
        }
    })
});


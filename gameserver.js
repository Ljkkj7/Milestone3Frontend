import dotenv from 'dotenv';
dotenv.config();

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const DJANGO_STOCK_GET_LIST = 'https://marketio-3cedad1469b3.herokuapp.com/stocks/';
const DJANGO_STOCK_UPDATE = 'https://marketio-3cedad1469b3.herokuapp.com/stocks/update/';

// Serve environment variables to the client
app.get('/env.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
        window.env = {
            API_BASE_URL: "${process.env.API_BASE_URL}",
            API_PORTFOLIO_PATH: "${process.env.API_PORTFOLIO_PATH}",
            API_BALANCE_PATH: "${process.env.API_BALANCE_PATH}",
            API_PAL_PATH: "${process.env.API_PAL_PATH}"
        };
    `);
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle stock requests
    fetchAndSendStocks(socket);

    const intervalId = setInterval(() => {
        console.log('Updating stock prices...');
        // Update stock prices every 5 seconds
        updateStockPrices();
        // Fetch and send the latest stock data
        console.log('Fetching stocks...');
        fetchAndSendStocks(socket);
    }, 5000); // 5 seconds

    // interval to refresh access token
    setInterval(async () => {
        await refreshToken();
    }, 14 * 60 * 1000) // refresh every 14 minutes [15 minute token lifetime]

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        clearInterval(intervalId);
    });
});

// Function to fetch stocks from Django API and send to client
async function fetchAndSendStocks(socket) {
    try {
        // Fetch stock data from the Django API
        console.log('Fetching stocks from Django API...');
        const response = await fetch(DJANGO_STOCK_GET_LIST);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const stocks = await response.json();
        // Emit the stocks data to the connected client
        socket.emit('stocks_data', stocks);
    } catch (error) {
        console.error('Error fetching stocks:', error);
    }
}

async function updateStockPrices(socket) {
    try {
        // Fetch updated stock prices from the Django API
        console.log('Updating stock prices from Django API...');
        const response = await fetch(DJANGO_STOCK_UPDATE, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Stock prices updated:', data);

        socket.emit('stocks_data', data);
    } catch (error) {
        console.error('Error updating stock prices:', error);
    }
}

async function refreshToken() {
    const res = await fetch('https://marketio-3cedad1469b3.herokuapp.com/custom_auth/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: localStorage.getItem('refresh_token') })
    });

    if (res.ok) {
        const data = await res.json()
        localStorage.setItem('access_token', data.access);
        return data.access;
    } else {
        alert('Session expired! Please log in again')
        window.location.href = 'index.html'
    }
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on https://marketio-frontend-139f7c2c9279.herokuapp.com:${PORT}`);
    // console.log(`Server is running on http://localhost:${PORT}`);
});
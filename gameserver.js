const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const DJANGO_STOCK_GET_LIST = 'https://marketio-3cedad1469b3.herokuapp.com/stocks/';
const DJANGO_STOCK_UPDATE = 'https://marketio-3cedad1469b3.herokuapp.com/stocks/update/';

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle stock requests
    fetchAndSendStocks(socket);

    const intervalId = setInterval(() => {
        updateStockPrice(socket);
        fetchAndSendStocks(socket);
    }, 5000); // Fetch stocks every 5 seconds

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        clearInterval(intervalId);
    });
});

// Function to fetch stocks from Django API and send to client
async function fetchAndSendStocks(socket) {
    try {
        const response = await fetch(DJANGO_STOCK_GET_LIST);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Emit the stocks data to the connected client
        socket.emit('stocks_data', stocks);
    } catch (error) {
        console.error('Error fetching stocks:', error);
    }
}

async function updateStockPrice() {
    try {
        const response = await fetch(DJANGO_STOCK_UPDATE);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Stock updated successfully:', data);
    } catch (error) {
        console.error('Error updating stock:', error);
    }
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on https://marketio-frontend-139f7c2c9279.herokuapp.com:${PORT}`);
    // console.log(`Server is running on http://localhost:${PORT}`);
});
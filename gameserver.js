const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const DJANGO_STOCK_GET_LIST = 'https://marketio-3cedad1469b3.herokuapp.com/stocks/';
const DJANGO_STOCK_UPDATE = 'https://marketio-3cedad1469b3.herokuapp.com/stocks/update/';
const DJANGO_STOCK_UPDATE_NEGATIVE = 'https://marketio-3cedad1469b3.herokuapp.com/stocks/update/negative/';
const DJANGO_STOCK_UPDATE_POSITIVE = 'https://marketio-3cedad1469b3.herokuapp.com/stocks/update/positive/';
const DJANGO_RESET_STATUS = 'https://marketio-3cedad1469b3.herokuapp.com/stocks/update/eventend/';


let eventTrigger = false;

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

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Shared interval for *all* clients
setInterval(async () => {
    console.log('Updating stock prices...');
    await updateStockPrices();

    const shouldTriggerEvent = Math.random() <= 0.1;
    if (shouldTriggerEvent && !eventTrigger) {
        try {
            await triggerMarketEvent();
            eventTrigger = true;
        } catch (err) {
            console.error('Failed to trigger market event:', err);
        }
    }
}, 5000); // Every 5 seconds

async function triggerMarketEvent() {
    const eventIndicator = Math.floor(Math.random() * 2);
    try {
        const res = await fetch(DJANGO_STOCK_GET_LIST);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }
        const stocks = await res.json();
        const stock = stocks[Math.floor(Math.random() * stocks.length)];


        if (eventIndicator == 0) {
            const responsePositive = await fetch(DJANGO_STOCK_UPDATE_POSITIVE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ symbol: stock.symbol })
            })

            if (!responsePositive.ok) {
                throw new Error(`HTTP error! status: ${responsePositive.status}`)
            }

            console.log("Triggering positive stock event");

            io.emit('market_event', {
                type: 'positive',
                stock: stock.symbol
            })
        }

        if (eventIndicator == 1) {
            const responseNegative = await fetch(DJANGO_STOCK_UPDATE_NEGATIVE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ symbol: stock.symbol })
            })

            if (!responseNegative.ok) {
                throw new Error(`HTTP error! status: ${responseNegative.status}`)
            }

            console.log("Triggering negative stock event");

            io.emit('market_event', {
                type: 'negative',
                stock: stock.symbol
            })
        }

        const delay = Math.floor(Math.random() * 60001);
        setTimeout(async () => {
            try {
                await fetch(DJANGO_RESET_STATUS, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ symbol: stock.symbol })
                });
                console.log(`Reset status of ${stock.symbol} after ${delay}ms`);
            } catch (err) {
                console.error('Error resetting stock status:', err);
            }

            eventTrigger = false;
        }, delay);
    } catch(err) {
        console.error("Error triggering market event...", err)
    }
}

// Function to fetch stocks from Django API and send to clients
async function fetchAndSendStocks(socket) {
    try {

        // Fetch stock data from the Django API
        console.log('Fetching stocks from Django API...');
        const response = await fetch(DJANGO_STOCK_GET_LIST);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const stocks = await response.json();


        // Emit the stocks data to all connected clients
        socket.emit('stocks_data', stocks);

    } catch (error) {
        console.error('Error fetching stocks:', error);
    }
}

// Function to update stock prices
async function updateStockPrices() {

    try {

        // Fetch updated stock prices from the Django API
        console.log('Updating stock prices from Django API...');

        const response = await fetch(DJANGO_STOCK_UPDATE, 
            {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' } 
            });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        io.emit('stocks_data', data);

    } catch (error) {
        console.error('Error updating stock prices:', error);
    }
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on https://marketio-frontend-139f7c2c9279.herokuapp.com:${PORT}`);
    // console.log(`Server is running on http://localhost:${PORT}`);
});
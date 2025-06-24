import {
    createStockChart,
    updateStockChart
} from './stockChart.js';

const renderedStocks = new Set(); // To track rendered stocks
const container = document.getElementById('stocksGrid');
let priceHistory = JSON.parse(localStorage.getItem('priceHistory')) || {};
const previousPrices = {};
let labelHistory = JSON.parse(localStorage.getItem('labelHistory')) || {};

// Connect to the server using Socket.IO
const socket = io('https://marketio-frontend-139f7c2c9279.herokuapp.com'); // Adjust the URL as needed
/// const socket = io('http://localhost:3000'); // Use localhost for local development

const stockCharts = {};

// Load stored charts on page load
window.addEventListener('DOMContentLoaded', () => {
    for (const symbol in priceHistory) {
        if (!symbol) {
            console.warn(`Invalid stock data`);
            return; // Skip this stock if data is invalid
        }
        if (!renderedStocks.has(symbol)) {
            const lastPrice = priceHistory[symbol].at(-1) ?? 0;
            const stockCanvas = document.createElement('div');
            stockCanvas.className = 'stock-card';
            stockCanvas.innerHTML = `
                <div class="stock-title">${symbol}</div>
                <a href="stock-detail.html?symbol=${symbol}" class="stock-link">
                    <div class="stock-price" id="price-${symbol}">£${parseFloat(lastPrice).toFixed(2)}</div>
                    <canvas id="chart-${symbol}" width="400" height="200"></canvas>
                </a>
            `;
            container.appendChild(stockCanvas);
            renderedStocks.add(symbol);

            const stockCtx = document.getElementById(`chart-${symbol}`).getContext('2d');
            stockCharts[symbol] = createStockChart(stockCtx, symbol);
            stockCharts[symbol].data.labels = labelHistory[symbol] || [];
            stockCharts[symbol].data.datasets[0].data = priceHistory[symbol] || [];
            stockCharts[symbol].update();
        }
    }
});

// Flag to prevent duplicate listeners
socket.on('stocks_data', (stocks) => {
    // Log the received stock data for debugging
    console.log('Received stock data:', stocks);

    // Update the stock chart with new data

    stocks.forEach(stock => {
        const { symbol, price } = stock;
        const label = new Date().toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }); // Use current time as label & track it
        const numPrice = parseFloat(price); // Ensure price is a number
        if (!symbol || !price) {
            console.warn(`Invalid stock data received: ${JSON.stringify(stock)}`);
            return; // Skip this stock if data is invalid
        }

        if (!priceHistory[symbol]) priceHistory[symbol] = [];
        if (!labelHistory[symbol]) labelHistory[symbol] = [];

        priceHistory[symbol].push(numPrice);
        labelHistory[symbol].push(label);

        if (priceHistory[symbol].length > 20) {
            priceHistory[symbol].shift();
            labelHistory[symbol].shift();
        }

        localStorage.setItem('priceHistory', JSON.stringify(priceHistory));
        localStorage.setItem('labelHistory', JSON.stringify(labelHistory));

        // Check if the stock chart for this symbol already exists
        if (!renderedStocks.has(symbol)) {
            // Create a new chart for this stock if it doesn't exist
            const stockCanvas = document.createElement('div');
            stockCanvas.className = 'stock-card';
            stockCanvas.innerHTML = `
                <div class="stock-title">${symbol}</div>
                <a href="stock-detail.html?symbol=${symbol}" class="stock-link">
                    <div class="stock-price" id="price-${symbol}">£${parseFloat(price).toFixed(2)}</div>
                    <canvas id="chart-${symbol}" width="400" height="200"></canvas>
                </a>
            `;
            console.log(`Creating new chart for symbol: ${symbol}`);
            container.appendChild(stockCanvas);
            renderedStocks.add(symbol); // Add to rendered stocks set

            const stockCtx = document.getElementById(`chart-${symbol}`).getContext('2d');
            // Create a new stock chart for this symbol
            stockCharts[symbol] = createStockChart(stockCtx, symbol);
            console.log(stockCharts)
            console.log(priceHistory)
            console.log(labelHistory)

            previousPrices[symbol] = price;

        } else {
            stockCharts[symbol].data.labels = labelHistory[symbol];
            stockCharts[symbol].data.datasets[0].data = priceHistory[symbol];
            console.log(priceHistory)
            console.log(labelHistory)
            updateStockChart(stockCharts[symbol], label, numPrice);
        }
    });
});
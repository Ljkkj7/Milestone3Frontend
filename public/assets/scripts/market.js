import {
    createStockChart,
    updateStockChart
} from './stockChart.js';

const renderedStocks = new Set(); // To track rendered stocks
const container = document.getElementById('stocksGrid');

// Connect to the server using Socket.IO
const socket = io('https://marketio-frontend-139f7c2c9279.herokuapp.com'); // Adjust the URL as needed

const stockCharts = {};

socket.on('stocks_data', (stocks) => {
    // Log the received stock data for debugging
    console.log('Received stock data:', stocks);

    // Update the stock chart with new data

    stocks.forEach(stock => {
        const { symbol, price } = stock;
        const label = new Date().toLocaleTimeString(); // Use current time as label
        const numPrice = parseFloat(price); // Ensure price is a number
        if (!symbol || !price) {
            console.warn(`Invalid stock data received: ${JSON.stringify(stock)}`);
            return; // Skip this stock if data is invalid
        }
        // Check if the stock chart for this symbol already exists
        if (!renderedStocks.has(symbol)) {
            // Create a new chart for this stock if it doesn't exist
            const stockCanvas = document.createElement('div');
            stockCanvas.className = 'stock-card';
            stockCanvas.innerHTML = `
                <div class="stock-title">${symbol}</div>
                <a href="#stock-detail.html?symbol=${symbol}" class="stock-link">
                    <div class="stock-price" id="price-${symbol}">$${parseFloat(price).toFixed(2)}</div>
                    <canvas id="chart-${symbol}" width="250%" height="120"></canvas>
                </a>
            `;
            console.log(`Creating new chart for symbol: ${symbol}`);
            container.appendChild(stockCanvas);
            renderedStocks.add(symbol); // Add to rendered stocks set

            const stockCtx = document.getElementById(`chart-${symbol}`).getContext('2d');
            // Create a new stock chart for this symbol
            stockCharts[symbol] = createStockChart(stockCtx, symbol);

        }

        // Update the existing chart with the new data
        updateStockChart(stockCharts[symbol], label, numPrice);
    });
});

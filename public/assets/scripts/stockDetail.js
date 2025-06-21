import {
    createStockChart,
    updateStockChart
} from './stockChart.js'

document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect()

    const params = new URLSearchParams(window.location.search);
    const symbol = params.get('symbol');
    const container = document.getElementById('stock-detail');

    // let priceHistory = JSON.parse(localStorage.getItem('priceHistory'));
    // priceHistory[symbol] = priceHistory[symbol] || [];
    // let previousPrice = priceHistory[symbol][priceHistory[symbol].length - 1] || 0;

    const stockCanvas = document.createElement('div');
    stockCanvas.className = 'stock-card';
    stockCanvas.innerHTML = `
    <div class="stock-title">${symbol}</div>
    <a href="stock-detail.html?symbol=${symbol}" class="stock-link">
        <div class="stock-price" id="price-${symbol}">£${parseFloat(price).toFixed(2)}</div>
        <canvas id="chart-${symbol}" width="400" height="200"></canvas>
    </a>`;
    console.log(`Creating new individual chart for symbol: ${symbol}`);
    container.appendChild(stockCanvas);
    renderedStocks.add(symbol); // Add to rendered stocks set
    
    const stockCtx = document.getElementById(`chart-${symbol}`).getContext('2d');
    // Create a new stock chart for this symbol
    createStockChart(stockCtx, symbol);

    socket.on('stocks_data', (stocks) => {
        console.log("Recieved paramater", stocks)

        const { symbol, price } = stock;
        const label = new Date().toLocaleTimeString();
        const numPrice = parseFloat(price);

        updateStockChart(symbol, label, numPrice);
    })
})
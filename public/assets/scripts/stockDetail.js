import {
    createStockChart,
    updateStockChart
} from './stockChart.js'

document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect()

    const params = new URLSearchParams(window.location.search);
    const symbolUrl = params.get('symbol');
    const container = document.getElementById('stock-detail')

    document.getElementById('stockTitle').textContent = symbolUrl;

    // let priceHistory = JSON.parse(localStorage.getItem('priceHistory'));
    // priceHistory[symbol] = priceHistory[symbol] || [];

    const stockCanvas = document.createElement('div');
    stockCanvas.className = 'stock-card';
    stockCanvas.innerHTML = `
    <div class="stock-title">${symbol}</div>
    <a href="stock-detail.html?symbol=${symbol}" class="stock-link">
        <div class="stock-price" id="price-${symbol}">£${parseFloat(price).toFixed(2)}</div>
        <canvas id="chart-${symbol}" width="400" height="200"></canvas>
    </a>`;
    console.log(`Creating new chart for symbol: ${symbol}`);
    container.appendChild(stockCanvas);
    renderedStocks.add(symbol); // Add to rendered stocks set

    const stockCtx = document.getElementById(`chart-${symbol}`).getContext('2d');
    // let previousPrice = priceHistory[symbol][priceHistory[symbol].length - 1] || 0;
    const stockChart = createStockChart(stockCtx, symbolUrl);

    socket.on('stocks_data', (stocks) => {
        console.log("Recieved paramater", stocks)

        stocks.forEach(stock => {
            const { symbol, price } = stock;
            const label = new Date().toLocaleTimeString();
            const numPrice = parseFloat(price);

            if(symbolUrl === symbol) {
                updateStockChart(stockChart, label, numPrice)
            }
        });
    })
})
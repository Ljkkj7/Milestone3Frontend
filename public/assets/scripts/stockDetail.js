import {
    createStockChart,
    updateStockChart
} from './stockChart.js'

document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect()

    let stockRendered = false
    let stockChart;

    const params = new URLSearchParams(window.location.search);
    const symbolUrl = params.get('symbol');
    const container = document.getElementById('stock-detail')

    let priceHistory = JSON.parse(localStorage.getItem('priceHistory')) || {};
    priceHistory[symbolUrl] = priceHistory[symbolUrl] || [];
    document.getElementById('stockTitle').textContent = symbolUrl;

    // let priceHistory = JSON.parse(localStorage.getItem('priceHistory'));
    // priceHistory[symbol] = priceHistory[symbol] || [];

    socket.on('stocks_data', (stocks) => {
        console.log("Recieved paramater", stocks)

        stocks.forEach(stock => {
            const { symbol, price } = stock;
            const label = new Date().toLocaleTimeString();
            const numPrice = parseFloat(price);

            if(symbolUrl === symbol) {
                if(!stockRendered) {
                    const stockCanvas = document.createElement('div');
                    stockCanvas.className = 'stock-card';
                    stockCanvas.innerHTML = `
                    <div class="stock-title">${symbolUrl}</div>
                    <div class="stock-price" id="price-${symbolUrl}">£${parseFloat(price).toFixed(2)}</div>
                    <canvas id="chart-${symbolUrl}detail" width="400" height="200"></canvas>`;
                    
                    console.log(`Creating new chart for symbol: ${symbolUrl}detail`);
                    container.appendChild(stockCanvas);

                    const stockCtx = document.getElementById(`chart-${symbol}detail`).getContext('2d');
                    stockChart = createStockChart(stockCtx, symbol);
                    stockChart.data.labels = labelHistory[symbol] || [];
                    stockChart.data.datasets[0].data = priceHistory[symbol] || [];
                    stockChart.update();
                    stockRendered = true;
                }

                updateStockChart(stockChart, label, numPrice)
            }
        });
    })
})
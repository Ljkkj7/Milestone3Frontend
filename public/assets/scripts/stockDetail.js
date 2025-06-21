import {
    createStockChart,
    updateStockChart
} from './stockChart.js'

document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect()

    const params = new URLSearchParams(window.location.search);
    const symbolUrl = params.get('symbol');

    document.getElementById('stockTitle').textContent = symbol;

    // let priceHistory = JSON.parse(localStorage.getItem('priceHistory'));
    // priceHistory[symbol] = priceHistory[symbol] || [];

    const chartCtx = document.getElementById('stock-detail').getContext('2d');
    // let previousPrice = priceHistory[symbol][priceHistory[symbol].length - 1] || 0;
    createStockChart(chartCtx, symbolUrl);

    socket.on('stocks_data', (stocks) => {
        console.log("Recieved paramater", stocks)

        stocks.forEach(stock => {
            const { symbol, price } = stock;
            const label = new Date().toLocaleTimeString();
            const numPrice = parseFloat(price);

            if(symbolUrl === symbol) {
                updateStockChart(symbol, label, numPrice)
            }
        });
    })
})
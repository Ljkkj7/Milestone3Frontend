import {
    createStockChart,
    updateStockChart
} from './stockChart.js'

const DJANGO_GET_USER_BALANCE_FIGURES = 'https://marketio-3cedad1469b3.herokuapp.com/dashboard/balance/';
const DJANGO_GET_USER_PORTFOLIO_FIGURES = 'https://marketio-3cedad1469b3.herokuapp.com/dashboard/portfolio/';
const params = new URLSearchParams(window.location.search);
const symbolUrl = params.get('symbol');

document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect()

    let stockRendered = false
    let stockChart;

    const container = document.getElementById('stock-detail')

    let priceHistory = JSON.parse(localStorage.getItem('priceHistory')) || {};
    priceHistory[symbolUrl] = priceHistory[symbolUrl] || [];
    let labelHistory = JSON.parse(localStorage.getItem('labelHistory')) || {};
    labelHistory[symbolUrl] = labelHistory[symbolUrl] || [];

    // let priceHistory = JSON.parse(localStorage.getItem('priceHistory'));
    // priceHistory[symbol] = priceHistory[symbol] || [];

    socket.on('stocks_data', (stocks) => {
        console.log("Recieved paramater", stocks)
        loadDetailFigures();

        stocks.forEach(stock => {
            const { symbol, price } = stock;
            const label = new Date().toLocaleTimeString();
            const numPrice = parseFloat(price);

            if(symbolUrl === symbol) {
                if(!stockRendered) {
                    const stockCanvas = document.createElement('div');
                    stockCanvas.className = 'stock-card-detail';
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

async function loadDetailFigures() {
    const token = localStorage.getItem('access_token')

    if (!token) {
        alert("No login token found - please log in")
        window.location.href = 'index.html'
    }

    let stockHoldings = document.getElementById('stockQuantityHeld');
    let stockValue = document.getElementById('stockValueHeld');
    let userBalance = document.getElementById('userDetailBalance');

    // NEED TO WRITE A FUNCTION TO CALL THESE APIS INSTEAD OF RE WRITING
    try {
        const response = await fetch(DJANGO_GET_USER_BALANCE_FIGURES, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const res = await fetch(DJANGO_GET_USER_PORTFOLIO_FIGURES, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const balanceData = await response.json()
        const portoflioData = await res.json()

        userBalance.innerHTML = `
            <h3>Balance:</h3>
            <p>£${parseFloat(balanceData.balance).toFixed(2)}</p>
        `
        portoflioData.details.forEach(detail => {
            const { symbol, quantity, current_price, value } = detail;
            const numPrice = parseFloat(current_price);
            if (symbol == symbolUrl) {
                stockHoldings.innerHTML = `
                    <h3>${symbol} Held:</h3>
                    <p>${quantity} @ ${numPrice}</p>
                `

                stockValue.innerHTML = `
                    <h3>Total Value Held:</h3>
                    <p>£${value}</p>
                `
            } 
        });
    } catch(err) {
        alert(err)
    }
}
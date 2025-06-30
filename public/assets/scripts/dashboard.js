import {
    createStockChart,
    updateStockChart
} from './stockChart.js'

const socket = io.connect()
const DJANGO_GET_USER_PORTFOLIO_FIGURES = 'https://marketio-3cedad1469b3.herokuapp.com/dashboard/portfolio/';
const renderedHoldings = new Set();
const container = document.getElementById('dashboardCards');
const stockCharts = {};
let priceHistory = JSON.parse(localStorage.getItem('priceHistory')) || {};
let labelHistory = JSON.parse(localStorage.getItem('labelHistory')) || {};

window.addEventListener('DOMContentLoaded', async () => {
    const portfolioData = await loadDashboardData('PORTFOLIO_DATA');

    if (!portfolioData || !portfolioData.details) {
        console.error("Portfolio data not loaded properly.");
        return;
    }

    portfolioData.details.forEach(detail => {
        const symbol = detail.symbol;
        if (!renderedHoldings.has(symbol)) {
            const lastPrice = priceHistory[symbol]?.at(-1) ?? 0;

            const stockCanvas = document.createElement('div');
            stockCanvas.className = 'stock-card';
            stockCanvas.innerHTML = `
                <div class="stock-title">${symbol}</div>
                <a href="stock-detail.html?symbol=${symbol}" class="stock-link">
                    <div class="stock-price" id="price-${symbol}">£${parseFloat(lastPrice).toFixed(2)}</div>
                    <canvas id="chart-${symbol}" width="400" height="200"></canvas>
                </a>
                <div class="detail">
                    <h2>Buy Stock</h2>
                    <form id="buyForm" class="buy-form">
                        <label for="quantity">Quantity:</label>
                        <input type="number" id="buyQuantity" name="quantity" min="1" required>
                        <button type="submit">Buy</button>
                    </form>
                </div>
                <div class="detail">
                    <h2>Sell Stock</h2>
                    <form id="sellForm">
                        <label for="quantity">Quantity:</label>
                        <input type="number" id="sellQuantity" name="sellQuantity" min="1" required>
                        <button type="submit">Sell</button>
                    </form>
                </div>
            `;

            container.appendChild(stockCanvas);
            renderedHoldings.add(symbol);

            const stockCtx = document.getElementById(`chart-${symbol}`).getContext('2d');
            stockCharts[symbol] = createStockChart(stockCtx, symbol);
            stockCharts[symbol].data.labels = labelHistory[symbol] || [];
            stockCharts[symbol].data.datasets[0].data = priceHistory[symbol] || [];
            stockCharts[symbol].update();
        }
    });
});


socket.on('stocks_data', (stocks) => {

})

async function loadDashboardData(type){
    // Use this function for future API calls by importing it into other js files
    const token = localStorage.getItem('access_token')

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

        if (type == 'PORTFOLIO_DATA') {
            const portfolioData = await res.json();
            return(portfolioData);
        }

        if (type == 'USER_DATA') {
            const balanceData = await response.json();
            return(balanceData);
        }
    } catch(err){
        alert(err)
    }
}
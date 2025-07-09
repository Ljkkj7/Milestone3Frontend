import {
    createStockChart,
    updateStockChart
} from './stockChart.js'

const socket = io.connect()
const DJANGO_GET_USER_PORTFOLIO_FIGURES = 'https://marketio-3cedad1469b3.herokuapp.com/dashboard/portfolio/';
const DJANGO_GET_USER_BALANCE_FIGURES = 'https://marketio-3cedad1469b3.herokuapp.com/dashboard/balance/';
const DJANGO_GET_PANDL_FIGURES = 'https://marketio-3cedad1469b3.herokuapp.com/dashboard/pal/'
const renderedHoldings = new Set();
const container = document.getElementById('dashboardCards');
const stockCharts = {};
let priceHistory = JSON.parse(localStorage.getItem('priceHistory')) || {};
let labelHistory = JSON.parse(localStorage.getItem('labelHistory')) || {};

window.addEventListener('DOMContentLoaded', async () => {
    const portfolioData = await loadDashboardData('PORTFOLIO_DATA');
    const balanceData = await loadDashboardData('BALANCE_DATA');
    const palData = await loadDashboardDataData('PAL_DATA')

    document.getElementById('Username').textContent = balanceData.username;

    if (!portfolioData || !portfolioData.details) {
        console.error("Portfolio data not loaded properly.");
        return;
    }

    portfolioData.details.forEach(detail => {
        const symbol = detail.symbol;
        if (!renderedHoldings.has(symbol)) {
            const lastPrice = priceHistory[symbol]?.at(-1) ?? 0;

            const stockCanvas = document.createElement('div');
            stockCanvas.className = 'stock-cards';
            stockCanvas.innerHTML = `
                <div class="stock-dashboard-individual">
                    <div class="dashboard-graph">
                        <div class="stock-title">${symbol}</div>
                        <a href="stock-detail.html?symbol=${symbol}" class="stock-link">
                            <div class="stock-price" id="price-${symbol}">£${parseFloat(lastPrice).toFixed(2)}</div>
                            <canvas id="chart-${symbol}" width="400" height="200"></canvas>
                        </a>
                    </div>
                    <div class="detail-dashboard-container">
                        <div class="detail-dashboard-outer">
                            <div class="detail-dashboard">
                                <h2>Buy Stock</h2>
                                <form id="buyForm" class="buy-form">
                                    <label for="quantity">Quantity:</label>
                                    <input type="number" id="buyQuantity" name="quantity" min="1" required>
                                    <button type="submit">Buy</button>
                                </form>
                            </div>
                        </div>
                        <div class="detail-dashboard-outer">
                            <div class="detail-dashboard">
                                <h2>Sell Stock</h2>
                                <form id="sellForm">
                                    <label for="quantity">Quantity:</label>
                                    <input type="number" id="sellQuantity" name="sellQuantity" min="1" required>
                                    <button type="submit">Sell</button>
                                </form>
                            </div>
                        </div>
                        <div class="detail-dashboard-outer">
                            <div class="detail-dashboard">
                                <h2>Stock P&L</h2>
                                <p id="PAL">${palData.details.profit_loss}</p>
                            </div>
                        </div>
                        <div class="detail-dashboard-outer">
                            <div class="detail-dashboard">
                                <h2>Avg. Buy Price</h2>
                                <p id="PAL">${palData.details.average_buy_price}</p>
                            </div>
                        </div>
                    </div>
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
    stocks.forEach(stock => {
        const {symbol, price} = stock;
        const numPrice = parseFloat(price)
        const label = new Date().toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        if (!symbol || !price) {
            console.warn(`Invalid stock data received: ${JSON.stringify(stock)}`);
            return; // Skip this stock if data is invalid
        }

        if (!priceHistory[symbol]) priceHistory[symbol] = [];
        if (!labelHistory[symbol]) labelHistory[symbol] = [];

        priceHistory[symbol].push(numPrice);
        labelHistory[symbol].push(label);

        if (priceHistory[symbol].length > 20) {
            //Code to delete bloated pricehistory arrays from testing
            while(priceHistory[symbol].length > 21){
                priceHistory[symbol].shift()
            }
            priceHistory[symbol].shift();
            labelHistory[symbol].shift();
        }

        localStorage.setItem('priceHistory', JSON.stringify(priceHistory));
        localStorage.setItem('labelHistory', JSON.stringify(labelHistory));

        if(renderedHoldings.has(symbol)){
            updateStockChart(stockCharts[symbol], label, numPrice)
        }
    })
});

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

        const resPal = await fetch(DJANGO_GET_PANDL_FIGURES, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        if (!resPal.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        if (type == 'PORTFOLIO_DATA') {
            const portfolioData = await res.json();
            return(portfolioData);
        }

        if (type == 'USER_DATA') {
            const balanceData = await response.json();
            return(balanceData);
        }

        if (type == 'PAL_DATA') {
            const palData = await resPal.json();
            return(palData);
        }
    } catch(err){
        alert(err)
    }
}
import {
    createStockChart,
    updateStockChart
} from './stockChart.js'

import {
    getUserIdFromUrl,
} from './profile.js';

const socket = io.connect();
const DJANGO_GET_USER_PORTFOLIO_FIGURES = 'https://marketio-3cedad1469b3.herokuapp.com/dashboard/portfolio/';
const DJANGO_GET_USER_BALANCE_FIGURES = 'https://marketio-3cedad1469b3.herokuapp.com/dashboard/balance/';
const DJANGO_GET_PANDL_FIGURES = 'https://marketio-3cedad1469b3.herokuapp.com/dashboard/pal/'
const renderedHoldings = new Set();
const holdings = {};
const container = document.getElementById('dashboardCards');
const stockCharts = {};
let priceHistory = JSON.parse(localStorage.getItem('priceHistory')) || {};
let labelHistory = JSON.parse(localStorage.getItem('labelHistory')) || {};

window.addEventListener('DOMContentLoaded', async () => {
    const portfolioData = await loadDashboardData('PORTFOLIO_DATA');
    const balanceData = await loadDashboardData('BALANCE_DATA');
    const palData = await loadDashboardData('PAL_DATA');

    // document.getElementById('Username').textContent = balanceData.username;

    if (!portfolioData || !portfolioData.details) {
        console.error("Portfolio data not loaded properly.");
        return;
    }

    portfolioData.details.forEach(detail => {
        const symbol = detail.symbol;
        if (!renderedHoldings.has(symbol)) {
            const lastPrice = priceHistory[symbol]?.at(-1) ?? 0;

            const palDetail = palData.details.find(d => d.symbol === symbol);
            const profitLoss = palDetail ? palDetail.profit_loss : 'N/A';
            const avgBuyPrice = palDetail ? palDetail.average_buy_price : 'N/A';

            if (palDetail) {
                holdings[symbol] = {
                    quantity: parseFloat(detail.quantity),
                    avgBuy: parseFloat(avgBuyPrice)
                };
            }

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
                        <div class="detail-dashboard-outer-stats">
                            <div class="detail-dashboard-outer">
                                <div class="detail-dashboard">
                                    <h3>Stock P&L</h3>
                                    <p id="pal-${symbol}" class="palDetail">£<span id="pal-${symbol}-detail">${parseFloat(profitLoss).toFixed(2)}</span></p>
                                </div>
                            </div>
                            <div class="detail-dashboard-outer">
                                <div class="detail-dashboard">
                                    <h3>Avg. Buy Price</h3>
                                    <p  id="avg-buy-${symbol}" class="palDetail">£${parseFloat(avgBuyPrice).toFixed(2)}</p>
                                </div>
                            </div>
                            <div class="detail-dashboard-outer">
                                <div class="detail-dashboard" id="stockQuantityHeld${symbol}">
                                </div>
                            </div>
                            <div class="detail-dashboard-outer">
                                <div class="detail-dashboard" id="stockValueHeld${symbol}">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(stockCanvas);
            renderedHoldings.add(symbol);

            loadDetailFigures();

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
            updatePalFigures(symbol, numPrice);
            loadDetailFigures(symbol)
        }
    })
});

export async function loadDashboardData(type) {
    const token = localStorage.getItem('access_token');

    try {
        const [targetBalanceRes, balanceRes, portfolioRes, palRes] = await Promise.all([
            fetch(`${DJANGO_GET_USER_BALANCE_FIGURES}?target_user=${getUserIdFromUrl()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }),
            fetch(DJANGO_GET_USER_BALANCE_FIGURES, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }),
            fetch(DJANGO_GET_USER_PORTFOLIO_FIGURES, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }),
            fetch(DJANGO_GET_PANDL_FIGURES, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
        ]);

        // Check for HTTP errors before parsing
        if (!targetBalanceRes.ok) throw new Error(`Target Balance API error: ${targetBalanceRes.status}`);
        if (!balanceRes.ok) throw new Error(`Balance API error: ${balanceRes.status}`);
        if (!portfolioRes.ok) throw new Error(`Portfolio API error: ${portfolioRes.status}`);
        if (!palRes.ok) throw new Error(`P&L API error: ${palRes.status}`);

        // Parse all responses
        const [targetBalanceData, balanceData, portfolioData, palData] = await Promise.all([
            targetBalanceRes.json(),
            balanceRes.json(),
            portfolioRes.json(),
            palRes.json()
        ]);

        if (type === 'TARGET_USER_DATA') return targetBalanceData;
        if (type === 'USER_DATA') return balanceData;
        if (type === 'PORTFOLIO_DATA') return portfolioData;
        if (type === 'PAL_DATA') return palData;

    } catch (err) {
        console.error("Dashboard data fetch failed:", err);
        alert("Failed to load dashboard data: " + err.message);
    }
}

function updatePalFigures(symbol, price) {
    const data = holdings[symbol];
    if (!data) return;

    const {quantity, avgBuy} = data;
    const pnl = (parseFloat(price) - avgBuy) * quantity;

    const palEl = document.getElementById(`pal-${symbol}-detail`);
    const prevPal = parseFloat(palEl.innerText);

    console.log(data, pnl, price, avgBuy, quantity, symbol, prevPal)
    const avgBuyEl = document.getElementById(`avg-buy-${symbol}`);

    if (palEl) palEl.textContent = `${pnl.toFixed(2)}`;
    if (avgBuyEl) avgBuyEl.textContent = `£${avgBuy.toFixed(2)}`;

    flashUpdate(palEl, pnl, prevPal);
}

function flashUpdate(el, value, prevValue) {
    if (!el) return;
    el.style.transition = 'color 0.3s';
    el.style.color = value >= prevValue ? 'green' : 'red';
    setTimeout(() => {
        el.style.color = '';
    }, 800);
}

async function loadDetailFigures() {
    const portfolioData = await loadDashboardData('PORTFOLIO_DATA');

    portfolioData.details.forEach(detail => {
        const { symbol, quantity, current_price, value } = detail;
        const numPrice = parseFloat(current_price);

        let quantityHeld = document.getElementById(`stockQuantityHeld${symbol}`);
        let valueHeld = document.getElementById(`stockValueHeld${symbol}`);

            quantityHeld.innerHTML = `
                <h3>${symbol} Held:</h3>
                <p>${quantity} @ ${numPrice}</p>
            `

            valueHeld.innerHTML = `
                <h3>Total Value Held:</h3>
                <p>£${value}</p>
            `
    })
}

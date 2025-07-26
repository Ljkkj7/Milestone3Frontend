export function createStockChart(ctx, symbol) {
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: `${symbol} Stock Price`,
                data: [],
                borderColor: 'white',            // Line color
                backgroundColor: 'white',        // Data point color
                borderWidth: 2,
                fill: false,
                tension: 0.1,
                pointBackgroundColor: 'white',   // Dot fill
                pointBorderColor: 'white',       // Dot outline
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            elements: {
                point: {
                    radius: 3,                // Dot size
                    hoverRadius: 5            // Dot size on hover
                }
            },
            animation: {
                duration: 0                // Disable animation for performance
            },
            layout: {
                padding: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'white'           // Legend label color
                    }
                }
            },
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Time',
                        color: 'white'           // X axis title color
                    },
                    ticks: {
                        color: 'white'           // X axis tick labels
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'  // Light white grid
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (GBP)',
                        color: 'white'           // Y axis title color
                    },
                    ticks: {
                        color: 'white'           // Y axis tick labels
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'  // Light white grid
                    },
                    beginAtZero: false
                }
            }
        }
    });

    return chart;
}

export function updateStockChart(chart, label, price) {
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(price);

    let cardPrice = document.getElementById(`price-${chart.data.datasets[0].label.split(' ')[0]}`);
    if (cardPrice) {
        cardPrice.textContent = `£${parseFloat(price).toFixed(2)}`;
    } else {
        console.warn(`Price element not found for symbol: ${chart.data.datasets[0].label.split(' ')[0]}`);
    }

    // Limit the number of data points to the last 20 for better performance
    if (chart.data.labels.length > 20) {    
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    // Update the chart
    chart.update();
}
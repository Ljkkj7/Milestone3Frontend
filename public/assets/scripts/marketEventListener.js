import { getEventTemplate } from "./eventTemplates.js";

const socket = io.connect();

socket.on('market_event', (marketEvent) => {
    console.log(marketEvent)
    showEventBanner(marketEvent.stock, marketEvent.type);
})

function showEventBanner(symbol, type){
    const eventContainer = document.getElementById('market-event-container');
    const eventDiv = document.createElement('div');
    const html = getEventTemplate(type, symbol);

    eventDiv.className = 'market-event';
    eventDiv.innerHTML = html;

    eventContainer.append(eventDiv);

    setTimeout(() => {
        eventDiv.remove();
    }, 10000);
}
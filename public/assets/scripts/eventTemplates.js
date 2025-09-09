const positiveTemplates = [
    (symbol) => `
        <div class="event-card positive">
            🚀 <strong>${symbol}</strong> surges after acquisition rumors!
        </div>`,
    (symbol) => `
        <div class="event-card positive">
            ✅ Major tech upgrade boosts <strong>${symbol}</strong> shares.
        </div>`,
    (symbol) => `
        <div class="event-card positive">
            💼 <strong>${symbol}</strong> announces record-breaking quarterly profits!
        </div>`
];

const negativeTemplates = [
    (symbol) => `
        <div class="event-card negative">
            ⚠️ <strong>${symbol}</strong> hit by insider trading scandal.
        </div>`,
    (symbol) => `
        <div class="event-card negative">
            📉 <strong>${symbol}</strong> tumbles after disappointing earnings report.
        </div>`,
    (symbol) => `
        <div class="event-card negative">
            🔻 <strong>${symbol}</strong> faces regulatory investigation.
        </div>`
];

const getRandomTemplate = (templatesArray, symbol) => {
    const randomIndex = Math.floor(Math.random() * templatesArray.length);
    return templatesArray[randomIndex](symbol);
};

export function getEventTemplate(eventType, symbol) {
    switch (eventType) {
        case 'positive':
            return getRandomTemplate(positiveTemplates, symbol);
        case 'negative':
            return getRandomTemplate(negativeTemplates, symbol);
        default:
            return `
                <div class="event-card">
                    💬 Market event on <strong>${symbol}</strong>.
                </div>`;
    }
}
let TARGET_ALUS = new Set();
let MINIMUM_AMOUNT = 2500;

async function loadConfig() {
    const url = chrome.runtime.getURL("alus.json");
    const response = await fetch(url);
    const config = await response.json();

    TARGET_ALUS = new Set(config.alus);
    MINIMUM_AMOUNT = config.minimumAmount;
}

function getTransactionTotal() {
    const totalInput = document.getElementById("documentTotal");
    if (!totalInput) return 0;

    return parseFloat(totalInput.value.replace(/[₱,]/g, "")) || 0;
}

function hasTargetALU() {
    const pageText = document.body.innerText;

    for (const alu of TARGET_ALUS) {
        if (pageText.includes(alu)) {
            return true;
        }
    }

    return false;
}

function updateTenderButton() {
    const tender = document.getElementById("tenderbutton");
    if (!tender) return;

    const total = getTransactionTotal();

    if (hasTargetALU() && total < MINIMUM_AMOUNT) {
        tender.disabled = true;
    } else {
        tender.disabled = false;
    }
}

(async () => {
    await loadConfig();

    updateTenderButton();

    setInterval(updateTenderButton, 500);
})();
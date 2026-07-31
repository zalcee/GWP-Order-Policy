const TARGET_ALUS = new Set([
    "1000018795001"
]);

const MINIMUM_AMOUNT = 2500;

// Get transaction total
function getTransactionTotal() {
    const totalInput = document.getElementById("documentTotal");

    if (!totalInput) {
        return 0;
    }

    return parseFloat(
        totalInput.value.replace(/[₱,]/g, "")
    ) || 0;
}

// Check if any target ALU exists on the page
function hasTargetALU() {
    const pageText = document.body.innerText;

    for (const alu of TARGET_ALUS) {
        if (pageText.includes(alu)) {
            return true;
        }
    }

    return false;
}

// Enable/Disable Tender button
function updateTenderButton() {
    const tenderButton = document.getElementById("tenderbutton");

    if (!tenderButton) {
        return;
    }

    const total = getTransactionTotal();
    const hasALU = hasTargetALU();

    if (hasALU && total < MINIMUM_AMOUNT) {
        tenderButton.disabled = true;
        tenderButton.style.pointerEvents = "none";
        tenderButton.style.opacity = "0.5";
        tenderButton.title = `Minimum purchase of ₱${MINIMUM_AMOUNT.toLocaleString()} required.`;
    } else {
        tenderButton.disabled = false;
        tenderButton.style.pointerEvents = "";
        tenderButton.style.opacity = "";
        tenderButton.title = "";
    }

    console.log({
        hasALU,
        total,
        disabled: tenderButton.disabled
    });
}

updateTenderButton();

const observer = new MutationObserver(updateTenderButton);

observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
});

setInterval(updateTenderButton, 500);
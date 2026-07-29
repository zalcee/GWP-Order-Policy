// ===============================
// Configuration
// ===============================

const TARGET_ALUS = new Set(ALU_CONFIG.alus);
const MINIMUM_AMOUNT = ALU_CONFIG.minimumAmount;


// ===============================
// Read Transaction Total
// ===============================

function getTransactionTotal() {

    const totalInput = document.getElementById("documentTotal");

    if (!totalInput)
        return 0;

    return parseFloat(
        totalInput.value.replace(/[₱,]/g, "")
    ) || 0;

}


// ===============================
// Detect Restricted ALU
// ===============================

function hasRestrictedALU() {

    const pageText = document.body.innerText;

    for (const alu of TARGET_ALUS) {

        if (pageText.includes(alu)) {

            return true;

        }

    }

    return false;

}


// ===============================
// Enable / Disable Tender Button
// ===============================

function updateTenderButton() {

    const tenderButton = document.getElementById("tenderbutton");

    if (!tenderButton)
        return;

    const total = getTransactionTotal();
    const hasALU = hasRestrictedALU();

    if (hasALU && total < MINIMUM_AMOUNT) {

        tenderButton.disabled = true;
        tenderButton.style.pointerEvents = "none";
        tenderButton.style.opacity = "0.5";
        tenderButton.title =
            `Minimum purchase of ₱${MINIMUM_AMOUNT.toLocaleString()} required.`;

    }
    else {

        tenderButton.disabled = false;
        tenderButton.style.pointerEvents = "";
        tenderButton.style.opacity = "";
        tenderButton.title = "";

    }

}


// ===============================
// Observe Changes
// ===============================

const observer = new MutationObserver(() => {

    updateTenderButton();

});

observer.observe(document.body, {

    childList: true,
    subtree: true,
    characterData: true

});


// Initial Run
updateTenderButton();


// Backup Check
setInterval(updateTenderButton, 500);
// =========================
// Configuration
// =========================
const TARGET_ALUS = new Set([
    "1000019215006",
    "1000018795001",
    "1000011111111",
    "1000012222222"
]);

const SPECIAL_ALU = "1000018795001";
const REQUIRED_COMMENT = "JULYTB";
const MINIMUM_AMOUNT = 2500;

// Cache
let cachedPageText = "";
let observerTimer = null;

// =========================
// Update cached page text
// =========================
function refreshPageText() {
    cachedPageText = document.body.innerText || "";
}

// =========================
// Get transaction total
// =========================
function getTransactionTotal() {
    const totalInput = document.getElementById("documentTotal");

    if (!totalInput) return 0;

    return parseFloat(
        totalInput.value.replace(/[₱,]/g, "")
    ) || 0;
}

// =========================
// Check ALU
// =========================
function hasALU(alu) {
    return cachedPageText.includes(alu);
}

function hasTargetALU() {
    for (const alu of TARGET_ALUS) {
        if (cachedPageText.includes(alu)) {
            return true;
        }
    }
    return false;
}

// =========================
// Get Comment1
// =========================
function getComment1() {

    let input =
        document.querySelector("#transactionDetailsForm #comment1") ||
        document.getElementById("comment1");

    if (!input) return "";

    return input.value.trim().toUpperCase();
}

// =========================
// Enable / Disable Tender
// =========================
function updateTenderButton() {

    const tenderButton = document.getElementById("tenderbutton");

    if (!tenderButton)
        return;

    const total = getTransactionTotal();
    const hasTarget = hasTargetALU();
    const hasSpecial = hasALU(SPECIAL_ALU);
    const comment1 = getComment1();

    let disable = false;

    if (hasTarget && total < MINIMUM_AMOUNT) {
        disable = true;
    }

    // Exception
    if (hasSpecial && comment1 === REQUIRED_COMMENT) {
        disable = false;
    }

    if (tenderButton.disabled !== disable) {
        tenderButton.disabled = disable;
        tenderButton.style.pointerEvents = disable ? "none" : "";
        tenderButton.style.opacity = disable ? "0.5" : "";
        tenderButton.title = disable
            ? `Minimum purchase of ₱${MINIMUM_AMOUNT.toLocaleString()} required.`
            : "";
    }
}

// =========================
// Initial
// =========================
refreshPageText();
updateTenderButton();

// =========================
// Observe DOM Changes
// =========================
const observer = new MutationObserver(() => {

    clearTimeout(observerTimer);

    observerTimer = setTimeout(() => {
        refreshPageText();
        updateTenderButton();
    }, 100);

});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// =========================
// Update when Comment1 changes
// =========================
document.addEventListener("input", (e) => {

    if (e.target && e.target.id === "comment1") {
        updateTenderButton();
    }

});
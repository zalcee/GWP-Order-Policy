
const TARGET_ALUS = new Set([
    "1000018795001"
]);

let lastState = null;


/*
============================================================
GET TRANSACTION AREA
============================================================
*/

function getTransactionArea() {
    return (
        document.getElementById("transactionItems") ||
        document.getElementById("searchTransactionItemsResultList") ||
        document.body
    );
}


/*
============================================================
CHECK TARGET ALU
============================================================
*/

function hasTargetALU() {

    const text = getTransactionArea().innerText || "";

    for (const alu of TARGET_ALUS) {
        const regex = new RegExp("\\b" + alu + "\\b");

        if (regex.test(text)) {
            return true;
        }
    }

    return false;
}


/*
============================================================
CHECK DISCOUNT
============================================================
*/

function hasDiscount() {

    const text = getTransactionArea()
        .innerText
        .replace(/\s+/g, " ");

    const regex = /Disc\s*%|Disc(?:ount)?\s*Amt/gi;

    let match;

    while ((match = regex.exec(text)) !== null) {

        const remaining = text.substring(regex.lastIndex);

        const valueMatch = remaining.match(
            /^\s*[:：]?\s*[₱$]?\s*(-?[\d,]+(?:\.\d+)?)/ 
        );

        if (!valueMatch) continue;

        const value = parseFloat(
            valueMatch[1].replace(/,/g, "")
        );

        if (value > 0) {
            return true;
        }
    }

    return false;
}


/*
============================================================
UPDATE TENDER BUTTON
============================================================
*/

function updateTenderButton() {

    const tenderButton = document.getElementById("tenderbutton");

    if (!tenderButton) return;

    const targetPresent = hasTargetALU();

    // Only validate discounts when target ALU exists.
    const discountDetected =
        targetPresent && hasDiscount();

    if (
        lastState === discountDetected &&
        tenderButton.disabled === discountDetected
    ) {
        return;
    }

    lastState = discountDetected;

    tenderButton.disabled = discountDetected;

    tenderButton.style.pointerEvents =
        discountDetected ? "none" : "";

    tenderButton.style.opacity =
        discountDetected ? "0.5" : "";

    tenderButton.title = discountDetected
        ? "Tender is not allowed: Discount detected with target ALU."
        : "";
}


/*
============================================================
CLICK PROTECTION
============================================================
*/

document.addEventListener("click", function(e) {

    const button = e.target.closest("#tenderbutton");

    if (!button) return;

    if (hasTargetALU() && hasDiscount()) {

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        updateTenderButton();

        console.warn(
            "Tender blocked: Target ALU exists and discount detected."
        );
    }

}, true);


/*
============================================================
MONITOR TRANSACTION CHANGES
============================================================
*/

const observer = new MutationObserver(updateTenderButton);

observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
});


/*
============================================================
INITIAL CHECK
============================================================
*/

updateTenderButton();

setInterval(updateTenderButton, 500);

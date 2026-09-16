const TARGET_ALUS = new Set([
    "1000018795001"
]);

const REQUIRED_PAIRS = 2;
const REQUIRED_COMMENT = "CTBGWP";

let savedComment1 = "";


/*
============================================================
TARGET ALU
============================================================
*/
function hasTargetALU() {
    const text = document.body.innerText || "";
    for (const alu of TARGET_ALUS) {
        if (text.includes(alu)) {
            return true;
        }
    }
    return false;
}


/*
============================================================
GET TRANSACTION AREA
============================================================
*/
function getTransactionArea() {
    const area =
        document.getElementById("searchTransactionItemsResultList");
    return area || document.body;
}


/*
============================================================
CHECK IF LOT NUMBER IS "PLUGIN MANAGER"
============================================================
*/
function isPairFromLotNumber(lotElement) {
    let current = lotElement;

    for (let level = 0; level < 6 && current; level++) {
        const text =
            current.textContent.replace(/\s+/g, " ").trim();

        if (/Lot Number/i.test(text) && /Plugin Manager/i.test(text)) {
            return true;
        }
        current = current.parentElement;
    }
    return false;
}


/*
============================================================
FIND THE FULL ITEM BLOCK (for ALU + Quantity)
============================================================

Walk further up from the Lot Number element until we find
a container whose text includes BOTH "ALU" and "Quantity" —
that's the full line-item block.
============================================================
*/
function findItemBlock(lotElement) {
    let current = lotElement;

    for (let level = 0; level < 10 && current; level++) {
        const text =
            current.textContent.replace(/\s+/g, " ").trim();

        if (/ALU\s*[0-9]+/i.test(text) && /Quantity\s*[0-9]+/i.test(text)) {
            return text;
        }
        current = current.parentElement;
    }
    return null;
}


/*
============================================================
GET PAIR COUNT (deduped by ALU)
============================================================
*/
function getPairCount() {

    const area = getTransactionArea();
    const allElements = area.querySelectorAll("*");

    const counted = new Set();
    const aluQuantities = new Map(); // ALU -> quantity (deduped)

    for (const element of allElements) {

        const text =
            element.textContent.replace(/\s+/g, " ").trim();

        if (text !== "Lot Number" && text !== "Lot Number Plugin Manager") {
            continue;
        }

        if (counted.has(element)) {
            continue;
        }
        counted.add(element);

        if (!isPairFromLotNumber(element)) {
            continue;
        }

        const blockText = findItemBlock(element);
        if (!blockText) {
            continue;
        }

        const aluMatch = blockText.match(/ALU\s*([0-9]+)/i);
        const qtyMatch = blockText.match(/Quantity\s*([0-9]+)/i);

        if (!aluMatch) {
            continue;
        }

        const alu = aluMatch[1];

        // Never count the gift item itself as a pair
        if (TARGET_ALUS.has(alu)) {
            continue;
        }

        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;

        // Dedup: if this ALU was already seen (e.g. rendered twice
        // in different panels), just keep the max quantity seen
        // rather than adding again.
        const existing = aluQuantities.get(alu) || 0;
        aluQuantities.set(alu, Math.max(existing, qty));
    }

    let pairCount = 0;
    for (const qty of aluQuantities.values()) {
        pairCount += qty;
    }

    return pairCount;
}


/*
============================================================
DEBUG PAIR DETECTION
============================================================
*/
function debugPairDetection() {
    const area = getTransactionArea();
    console.log("========== PAIR DEBUG ==========");
    console.log("Transaction area:", area);

    const allElements = area.querySelectorAll("*");
    const counted = new Set();
    const aluQuantities = new Map();

    for (const element of allElements) {
        const text = element.textContent.replace(/\s+/g, " ").trim();

        if (text !== "Lot Number" && text !== "Lot Number Plugin Manager") {
            continue;
        }
        if (counted.has(element)) continue;
        counted.add(element);

        const isPair = isPairFromLotNumber(element);
        const blockText = findItemBlock(element);
        const aluMatch = blockText && blockText.match(/ALU\s*([0-9]+)/i);
        const qtyMatch = blockText && blockText.match(/Quantity\s*([0-9]+)/i);

        console.log("Lot Number element:", element);
        console.log("PAIR:", isPair);
        console.log("ALU:", aluMatch ? aluMatch[1] : null);
        console.log("Quantity:", qtyMatch ? qtyMatch[1] : null);

        if (isPair && aluMatch && !TARGET_ALUS.has(aluMatch[1])) {
            const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
            const existing = aluQuantities.get(aluMatch[1]) || 0;
            aluQuantities.set(aluMatch[1], Math.max(existing, qty));
        }
    }

    let total = 0;
    for (const qty of aluQuantities.values()) total += qty;

    console.log("Deduped ALU -> Qty map:", aluQuantities);
    console.log("TOTAL PAIRS:", total);
    console.log("==============================");

    return total;
}


/*
============================================================
COMMENT1
============================================================
*/
function getComment1() {
    const input = document.getElementById("comment1");
    const totalInput = document.getElementById("documentTotal");

    if (totalInput && totalInput.value.trim().startsWith("-")) {
        savedComment1 = REQUIRED_COMMENT;
    } else if (input) {
        savedComment1 = input.value.trim().toUpperCase();
    }

    return savedComment1;
}


/*
============================================================
UPDATE TENDER BUTTON
============================================================
*/
function updateTenderButton() {

    const tenderButton = document.getElementById("tenderbutton");
    if (!tenderButton) return;

    if (!hasTargetALU()) {
        savedComment1 = "";
        tenderButton.disabled = false;
        tenderButton.style.pointerEvents = "";
        tenderButton.style.opacity = "";
        tenderButton.title = "";
        return;
    }

    const pairCount = getPairCount();
    const comment1 = getComment1();

    const validPairs = pairCount >= REQUIRED_PAIRS;
    const validComment = comment1 === REQUIRED_COMMENT;
    const disable = !(validPairs && validComment);

    tenderButton.disabled = disable;
    tenderButton.style.pointerEvents = disable ? "none" : "";
    tenderButton.style.opacity = disable ? "0.5" : "";

    if (disable) {
        if (!validPairs && !validComment) {
            tenderButton.title = "Buy at least 2 pairs and enter Comment1 = CTBGWP.";
        } else if (!validPairs) {
            tenderButton.title = `At least 2 pairs required. Current pairs: ${pairCount}`;
        } else if (!validComment) {
            tenderButton.title = "Comment1 = CTBGWP required.";
        }
    } else {
        tenderButton.title = "";
    }

    console.log({
        targetALU: true,
        pairCount,
        requiredPairs: REQUIRED_PAIRS,
        comment1,
        requiredComment: REQUIRED_COMMENT,
        validPairs,
        validComment,
        tenderDisabled: disable
    });
}


updateTenderButton();

const observer = new MutationObserver(() => {
    updateTenderButton();
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
});

document.addEventListener("input", (e) => {
    if (e.target && e.target.id === "comment1") {
        const totalInput = document.getElementById("documentTotal");
        if (!totalInput || !totalInput.value.trim().startsWith("-")) {
            savedComment1 = e.target.value.trim().toUpperCase();
        }
        updateTenderButton();
    }
}, true);

setInterval(updateTenderButton, 500);
const TARGET_ALUS = new Set([
    "1000018795001"
]);

const MINIMUM_AMOUNT = 2499;
const REQUIRED_COMMENT = "CTBGWP";

let savedComment1 = "";
let savedAmount = 0;

function getTransactionTotal() {

    const totalInput = document.getElementById("documentTotal");

    if (!totalInput) {
        return savedAmount;
    }

    let value = parseFloat(
        totalInput.value.replace(/[-₱,]/g, "")
    ) || 0;

    const hasALU = hasTargetALU();

    if (!hasALU) {
        savedAmount = 0;
        savedComment1 = "";
        return value;
    }

    if (value > 0) {
        savedAmount = value;
    } else {
        value = savedAmount;
    }

    return value;
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

function updateTenderButton() {

    const tenderButton = document.getElementById("tenderbutton");

    if (!tenderButton) {
        return;
    }

    const hasALU = hasTargetALU();

    if (!hasALU) {

        savedAmount = 0;
        savedComment1 = "";

        tenderButton.disabled = false;
        tenderButton.style.pointerEvents = "";
        tenderButton.style.opacity = "";
        tenderButton.title = "";

        return;
    }

    const total = getTransactionTotal();
    const comment1 = getComment1();

    const validAmount = total >= MINIMUM_AMOUNT;
    const validComment = comment1 === REQUIRED_COMMENT;

    const disable = !(validAmount && validComment);

    tenderButton.disabled = disable;
    tenderButton.style.pointerEvents = disable ? "none" : "";
    tenderButton.style.opacity = disable ? "0.5" : "";
    tenderButton.title = disable
        ? `Minimum purchase of ₱${MINIMUM_AMOUNT.toLocaleString()} and Comment1 = ${REQUIRED_COMMENT} required.`
        : "";


    // Help debug
    // console.log({
    //     hasALU,
    //     total,
    //     savedAmount,
    //     comment1,
    //     savedComment1,
    //     validAmount,
    //     validComment,
    //     disabled: disable
    // });
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
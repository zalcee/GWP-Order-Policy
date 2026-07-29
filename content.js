const disableTenderButton = () => {
    const btn = document.getElementById("tenderbutton");

    if (btn) {
        btn.disabled = true;
        btn.style.pointerEvents = "none";
        btn.style.opacity = "0.5";
        btn.title = "Disabled by Chrome Extension";
    }
}


disableTenderButton();


const observer = new MutationObserver(() => {
    disableTenderButton();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
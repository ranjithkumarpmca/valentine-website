document.addEventListener("DOMContentLoaded", () => {

    // ❤️ Name
    const nameEl = document.getElementById("name");
    nameEl.innerText = "Hey Nithya ❤️";

    const noBtn = document.getElementById("noBtn");
    const yesBtn = document.getElementById("yesBtn");
    const result = document.getElementById("result");
    const buttonsBox = document.querySelector(".buttons");

    // 📐 Container size
    const boxRect = buttonsBox.getBoundingClientRect();

    function moveNoButton() {
        const maxX = boxRect.width - noBtn.offsetWidth;
        const maxY = boxRect.height - noBtn.offsetHeight;

        const x = Math.random() * maxX;
        const y = Math.random() * maxY;

        noBtn.style.left = x + "px";
        noBtn.style.top = y + "px";
    }

    // 🚫 NO means NO — escape on every interaction
    ["mouseover", "mousedown", "mouseenter", "touchstart", "touchmove", "focus"].forEach(evt => {
        noBtn.addEventListener(evt, (e) => {
            e.preventDefault();
            moveNoButton();
        });
    });

    // 😈 Even YES kitta ponaalum NO odum
    ["mouseover", "touchstart"].forEach(evt => {
        yesBtn.addEventListener(evt, moveNoButton);
    });

    // 🚫 Absolute block: NO click never fires
    noBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        moveNoButton();
        return false;
    });

    // ❤️ YES = only destiny
    yesBtn.addEventListener("click", () => {
        buttonsBox.style.display = "none";
        result.classList.remove("hidden");
    });

});

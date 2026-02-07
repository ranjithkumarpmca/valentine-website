
document.addEventListener("DOMContentLoaded", () => {

    // ❤️ Name
    const nameEl = document.getElementById("name");
    nameEl.innerText = "Hey Nithya ❤️";

    const noBtn = document.getElementById("noBtn");
    const yesBtn = document.getElementById("yesBtn");
    const result = document.getElementById("result");
    const buttonsBox = document.querySelector(".buttons");
    const heartsContainer = document.getElementById("hearts");

    const noMessages = [
        "😤 Don’t touch me!",
        "🤨 This could be a mistake…",
        "❌ No means NO!",
        "😈 Only YES works!",
        "😂 Nice try!"
    ];
    let msgIndex = 0;

    // ❤️ Floating hearts create pannum
    setInterval(() => {
        const heart = document.createElement("div");
        heart.classList.add("heart");
        heart.innerText = "❤️";
        heart.style.left = Math.random() * 100 + "vw";
        heart.style.animationDuration = (3 + Math.random() * 3) + "s";
        heartsContainer.appendChild(heart);

        setTimeout(() => heart.remove(), 6000);
    }, 300);

    // 📐 Container size
    const boxRect = buttonsBox.getBoundingClientRect();

    function moveNoButton() {
        const maxX = boxRect.width - noBtn.offsetWidth;
        const maxY = boxRect.height - noBtn.offsetHeight;

        const x = Math.random() * maxX;
        const y = Math.random() * maxY;

        noBtn.style.left = x + "px";
        noBtn.style.top = y + "px";

        noBtn.innerText = noMessages[msgIndex];
        msgIndex = (msgIndex + 1) % noMessages.length;
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
        document.getElementById("question").style.display = "none";
    });

});



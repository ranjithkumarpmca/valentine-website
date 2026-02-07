document.addEventListener("DOMContentLoaded", () => {

    const noBtn = document.getElementById("noBtn");
    const yesBtn = document.getElementById("yesBtn");
    const noMsg = document.getElementById("noMsg");
    const result = document.getElementById("result");
    const question = document.getElementById("question");
    const heartsContainer = document.getElementById("hearts");

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

    // 😈 NO button escape
    function moveNo() {
        const x = Math.random() * 250;
        const y = Math.random() * 80;
        noBtn.style.left = x + "px";
        noBtn.style.top = y + "px";
    }

    noBtn.addEventListener("mouseover", moveNo);
    noBtn.addEventListener("touchstart", () => {
        noMsg.classList.remove("hidden");
        moveNo();
        setTimeout(() => noMsg.classList.add("hidden"), 1200);
    });

    noBtn.addEventListener("click", e => {
        e.preventDefault();
        moveNo();
    });

    // 🧲 YES magnet effect
    yesBtn.addEventListener("mouseover", () => {
        document.querySelectorAll(".heart").forEach(h => {
            h.style.left = "50vw";
        });
    });

    // 💥 YES click magic
    yesBtn.addEventListener("click", () => {
        document.querySelector(".buttons").style.display = "none";
        question.style.display = "none";
        result.classList.remove("hidden");

        // Hearts blast
        for (let i = 0; i < 30; i++) {
            const heart = document.createElement("div");
            heart.classList.add("heart");
            heart.innerText = "💖";
            heart.style.left = "50vw";
            heart.style.fontSize = "30px";
            heart.style.animationDuration = "2s";
            heartsContainer.appendChild(heart);

            setTimeout(() => heart.remove(), 2000);
        }
    });
});

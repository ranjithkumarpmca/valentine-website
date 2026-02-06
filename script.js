// Name from URL (WhatsApp link la pass pannalaam)
const params = new URLSearchParams(window.location.search);
const name = params.get("name") || "Hey";

document.getElementById("name").innerText = name + ", ❤️";

const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const result = document.getElementById("result");

// NO button odum 😈
noBtn.addEventListener("mouseover", () => {
    const x = Math.random() * 200;
    const y = Math.random() * 60;

    noBtn.style.left = x + "px";
    noBtn.style.top = y + "px";
});

// YES click panna happiness 🎉
yesBtn.addEventListener("click", () => {
    document.querySelector(".buttons").style.display = "none";
    result.classList.remove("hidden");
});

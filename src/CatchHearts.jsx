import { useState, useEffect, useRef, useCallback } from "react";

const GAME_WIDTH = 320;
const GAME_HEIGHT = 480;
const BASKET_WIDTH = 70;
const BASKET_HEIGHT = 40;
const HEART_SIZE = 28;
const HEARTS = ["❤️", "🧡", "💛", "💚", "💙", "💜", "🩷", "🌹", "💌", "✨", "🫶", "💫"];

export default function CatchHearts() {
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [lives, setLives] = useState(3);
  const [status, setStatus] = useState("idle");
  const [renderTick, setRenderTick] = useState(0);
  const startingRef = useRef(false);

  const game = useRef({
    hearts: [],
    basketX: GAME_WIDTH / 2 - BASKET_WIDTH / 2,
    score: 0,
    lives: 3,
    status: "idle",
    interval: null,
    spawnInterval: null,
    speed: 2.5,
    nextId: 0,
  });

  const forceRender = useCallback(() => setRenderTick(t => t + 1), []);

  const stopGame = useCallback(() => {
    const g = game.current;
    if (g.interval) { clearInterval(g.interval); g.interval = null; }
    if (g.spawnInterval) { clearInterval(g.spawnInterval); g.spawnInterval = null; }
  }, []);

  const spawnHeart = useCallback(() => {
    const g = game.current;
    if (g.status !== "playing") return;
    g.hearts.push({
      id: g.nextId++,
      x: Math.random() * (GAME_WIDTH - HEART_SIZE),
      y: -HEART_SIZE,
      emoji: HEARTS[Math.floor(Math.random() * HEARTS.length)],
    });
  }, []);

  const tick = useCallback(() => {
    const g = game.current;
    if (g.status !== "playing") return;

    g.hearts = g.hearts.map(h => ({ ...h, y: h.y + g.speed }));

    const bx = g.basketX;
    const by = GAME_HEIGHT - BASKET_HEIGHT - 10;

    const caught = [];
    const missed = [];

    g.hearts.forEach(h => {
      if (
        h.y + HEART_SIZE >= by &&
        h.y <= by + BASKET_HEIGHT &&
        h.x + HEART_SIZE >= bx &&
        h.x <= bx + BASKET_WIDTH
      ) {
        caught.push(h);
      } else if (h.y > GAME_HEIGHT) {
        missed.push(h);
      }
    });

    g.hearts = g.hearts.filter(h =>
      !caught.find(c => c.id === h.id) &&
      !missed.find(m => m.id === h.id)
    );

    if (caught.length > 0) {
      g.score += caught.length;
      setScore(g.score);
      setBest(b => Math.max(b, g.score));
      g.speed = Math.min(7, g.speed + 0.05 * caught.length);
    }

    if (missed.length > 0) {
      g.lives -= missed.length;
      if (g.lives <= 0) {
        g.lives = 0;
        g.status = "dead";
        setLives(0);
        stopGame();
        setStatus("dead");
        forceRender();
        return;
      }
      setLives(g.lives);
    }

    forceRender();
  }, [stopGame, forceRender]);

  const startGame = useCallback(() => {
    if (startingRef.current) return;
    startingRef.current = true;
    stopGame();

    const g = game.current;
    g.hearts = [];
    g.basketX = GAME_WIDTH / 2 - BASKET_WIDTH / 2;
    g.score = 0;
    g.lives = 3;
    g.status = "playing";
    g.speed = 2.5;
    g.nextId = 0;

    setScore(0);
    setLives(3);
    setStatus("playing");
    forceRender();

    g.interval = setInterval(tick, 16);
    g.spawnInterval = setInterval(spawnHeart, 1200);

    setTimeout(() => { startingRef.current = false; }, 200);
  }, [stopGame, tick, spawnHeart, forceRender]);

  useEffect(() => {
    const keys = {};
    const onKeyDown = (e) => { keys[e.key] = true; };
    const onKeyUp = (e) => { keys[e.key] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const moveInterval = setInterval(() => {
      const g = game.current;
      if (g.status !== "playing") return;
      if (keys["ArrowLeft"] || keys["a"]) {
        g.basketX = Math.max(0, g.basketX - 8);
        forceRender();
      }
      if (keys["ArrowRight"] || keys["d"]) {
        g.basketX = Math.min(GAME_WIDTH - BASKET_WIDTH, g.basketX + 8);
        forceRender();
      }
    }, 16);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      clearInterval(moveInterval);
    };
  }, [forceRender]);

  useEffect(() => () => stopGame(), [stopGame]);

  const dragRef = useRef(null);

  const onPointerDown = (e) => { dragRef.current = e.clientX; };
  const onPointerMove = (e) => {
    if (dragRef.current === null) return;
    const g = game.current;
    if (g.status !== "playing") return;
    const dx = e.clientX - dragRef.current;
    dragRef.current = e.clientX;
    g.basketX = Math.max(0, Math.min(GAME_WIDTH - BASKET_WIDTH, g.basketX + dx));
    forceRender();
  };
  const onPointerUp = () => { dragRef.current = null; };

  const moveBasket = (dir) => {
    const g = game.current;
    if (g.status !== "playing") return;
    g.basketX = Math.max(0, Math.min(GAME_WIDTH - BASKET_WIDTH, g.basketX + dir * 20));
    forceRender();
  };

  const g = game.current;

  return (
    <div style={{
      height: "100dvh", overflow: "hidden",
      background: "#0d0810",
      backgroundImage: "radial-gradient(ellipse at 30% 20%, rgba(180,40,100,0.15) 0%, transparent 60%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "Georgia, serif", userSelect: "none", gap: 10, padding: "8px 12px",
    }}>

      <h1 style={{ fontSize: "1.3rem", color: "#fff", fontWeight: 400, margin: 0, letterSpacing: "0.05em" }}>
        Catch the <span style={{ color: "#e05580" }}>Hearts</span> 💝
      </h1>

      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {[["Score", score], ["Best", best]].map(([label, val]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
            <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 300, lineHeight: 1 }}>{val}</div>
          </div>
        ))}
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Lives</div>
          <div style={{ fontSize: "1.1rem" }}>
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i}>{i < lives ? "❤️" : "🖤"}</span>
            ))}
          </div>
        </div>
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{
          position: "relative",
          width: GAME_WIDTH, height: GAME_HEIGHT,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(224,85,128,0.2)",
          borderRadius: 12, overflow: "hidden",
          boxShadow: "0 0 40px rgba(180,40,100,0.15)",
          cursor: "grab", touchAction: "none",
          maxWidth: "90vw",
        }}
      >
        {g.hearts.map(h => (
          <div key={h.id} style={{
            position: "absolute",
            left: h.x, top: h.y,
            fontSize: HEART_SIZE, lineHeight: 1,
            pointerEvents: "none",
          }}>
            {h.emoji}
          </div>
        ))}

        <div style={{
          position: "absolute",
          left: g.basketX,
          top: GAME_HEIGHT - BASKET_HEIGHT - 10,
          width: BASKET_WIDTH,
          height: BASKET_HEIGHT,
          background: "linear-gradient(135deg, rgba(224,85,128,0.4), rgba(142,68,173,0.4))",
          border: "2px solid rgba(224,85,128,0.6)",
          borderRadius: "0 0 20px 20px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.4rem",
          boxShadow: "0 0 20px rgba(224,85,128,0.3)",
        }}>
          🫶
        </div>

        {status !== "playing" && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(13,8,16,0.9)",
            backdropFilter: "blur(4px)",
            borderRadius: 12,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 12,
          }}>
            <div style={{ fontSize: "2.5rem" }}>{status === "dead" ? "💔" : "💝"}</div>
            <div style={{ color: "#fff", fontSize: "1rem", textAlign: "center", padding: "0 20px" }}>
              {status === "dead" ? "Game Over" : "Catch all the hearts! 💌"}
            </div>
            {status === "dead" && (
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>Score: {score}</div>
            )}
            <button onClick={startGame} style={{
              background: "linear-gradient(135deg, #e05580, #8e44ad)",
              border: "none", borderRadius: 50,
              color: "#fff", padding: "10px 28px",
              fontSize: "0.9rem", fontFamily: "Georgia, serif",
              cursor: "pointer",
            }}>
              {status === "dead" ? "Try Again 🌹" : "Start 💌"}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {[["←", -1], ["→", 1]].map(([label, dir]) => (
          <button
            key={label}
            onPointerDown={(e) => {
              e.preventDefault();
              moveBasket(dir);
              const interval = setInterval(() => moveBasket(dir), 50);
              const stop = () => { clearInterval(interval); window.removeEventListener("pointerup", stop); };
              window.addEventListener("pointerup", stop);
            }}
            style={{
              width: 72, height: 56,
              background: "rgba(224,85,128,0.12)",
              border: "1px solid rgba(224,85,128,0.25)",
              borderRadius: 12, color: "#e05580",
              fontSize: "1.5rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              touchAction: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >{label}</button>
        ))}
      </div>

      <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.7rem", margin: 0 }}>
        Arrow keys / drag / buttons
      </p>
    </div>
  );
}

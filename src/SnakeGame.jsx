import { useState, useEffect, useCallback, useRef } from "react";

const GRID = 20;
const CELL = 24;
const INITIAL_SPEED = 150;
const HEARTS = ["🌹", "💌", "✨", "🫶", "💫"];

const randomPos = (snake) => {
  let pos;
  do {
    pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
};

const DPadBtn = ({ label, onClick, col, row }) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onClick(); }}
    style={{
      gridColumn: col, gridRow: row,
      width: 52, height: 52,
      background: "rgba(224,85,128,0.12)",
      border: "1px solid rgba(224,85,128,0.25)",
      borderRadius: 12, color: "#e05580",
      fontSize: "1.3rem", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      touchAction: "none",
    }}
  >{label}</button>
);

export default function SnakeGame() {
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState("idle");
  const [renderTick, setRenderTick] = useState(0);

  // snake segments: [{ x, y, emoji }]
  // head has no emoji, body segments carry the emoji they were collected as
  const snakeRef = useRef([{ x: 10, y: 10, emoji: null }]);
  const dirRef = useRef({ x: 1, y: 0 });
  const foodRef = useRef({ x: 15, y: 10 });
  const speedRef = useRef(INITIAL_SPEED);
  const statusRef = useRef("idle");
  const scoreRef = useRef(0);
  const foodEmojiRef = useRef("🌹");
  const particlesRef = useRef([]);
  const intervalRef = useRef(null);
  const touchStart = useRef(null);

  const forceRender = useCallback(() => setRenderTick(t => t + 1), []);

  const stopGame = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const s = snakeRef.current;
    const d = dirRef.current;
    if (!d || !s || s.length === 0) return;

    const head = { x: s[0].x + d.x, y: s[0].y + d.y, emoji: null };

    if (
      head.x < 0 || head.x >= GRID ||
      head.y < 0 || head.y >= GRID ||
      s.some(seg => seg.x === head.x && seg.y === head.y)
    ) {
      stopGame();
      statusRef.current = "dead";
      setStatus("dead");
      return;
    }

    const newSnake = [head, ...s];
    const f = foodRef.current;
    const collectedEmoji = foodEmojiRef.current;

    if (head.x === f.x && head.y === f.y) {
      // Ate food - assign collected emoji to the segment right after head
      newSnake[1] = { ...newSnake[1], emoji: collectedEmoji };

      const newScore = scoreRef.current + 1;
      scoreRef.current = newScore;
      setScore(newScore);
      setBest(b => Math.max(b, newScore));

      speedRef.current = Math.max(60, speedRef.current - 3);
      foodRef.current = randomPos(newSnake);
      foodEmojiRef.current = HEARTS[Math.floor(Math.random() * HEARTS.length)];

      const newP = Array.from({ length: 4 }, (_, i) => ({
        id: Date.now() + i,
        x: f.x * CELL + CELL / 2,
        y: f.y * CELL + CELL / 2,
        emoji: collectedEmoji,
      }));
      particlesRef.current = [...particlesRef.current, ...newP];
      setTimeout(() => {
        particlesRef.current = particlesRef.current.filter(p => !newP.find(n => n.id === p.id));
        forceRender();
      }, 700);

      stopGame();
      intervalRef.current = setInterval(tick, speedRef.current);
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
    forceRender();
  }, [stopGame, forceRender]);

  const startGame = useCallback(() => {
    stopGame();
    const initSnake = [{ x: 10, y: 10, emoji: null }];
    snakeRef.current = initSnake;
    dirRef.current = { x: 1, y: 0 };
    foodRef.current = randomPos(initSnake);
    speedRef.current = INITIAL_SPEED;
    scoreRef.current = 0;
    foodEmojiRef.current = HEARTS[Math.floor(Math.random() * HEARTS.length)];
    particlesRef.current = [];
    statusRef.current = "playing";
    setScore(0);
    setStatus("playing");
    forceRender();
    intervalRef.current = setInterval(tick, INITIAL_SPEED);
  }, [stopGame, tick, forceRender]);

  const handleDir = useCallback((newDir) => {
    if (statusRef.current !== "playing") { startGame(); return; }
    const cur = dirRef.current;
    if (newDir.x === -cur.x && newDir.y === -cur.y) return;
    dirRef.current = newDir;
  }, [startGame]);

  useEffect(() => {
    const onKey = (e) => {
      const map = {
        ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
      };
      const newDir = map[e.key];
      if (!newDir) return;
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
      handleDir(newDir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleDir]);

  useEffect(() => () => stopGame(), [stopGame]);

  const onTouchStart = (e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    handleDir(Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 })
      : (dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 }));
  };

  const boardSize = GRID * CELL;
  const snake = snakeRef.current;
  const food = foodRef.current;
  const particles = particlesRef.current;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0810",
      backgroundImage: "radial-gradient(ellipse at 30% 20%, rgba(180,40,100,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(100,20,140,0.12) 0%, transparent 50%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "Georgia, serif", padding: 20, userSelect: "none",
    }}>
      <style>{`
        @keyframes foodPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }
        @keyframes fadeUp { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-40px)} }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: "clamp(1.6rem,5vw,2.4rem)", color: "#fff", fontWeight: 400, letterSpacing: "0.05em", margin: 0 }}>
          Love <span style={{ color: "#e05580" }}>Snake</span> 🐍
        </h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", marginTop: 6 }}>collect the hearts 🌹</p>
      </div>

      <div style={{ display: "flex", gap: 40, marginBottom: 20 }}>
        {[["Score", score], ["Best", best]].map(([label, val]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
            <div style={{ color: "#fff", fontSize: "1.8rem", fontWeight: 300, lineHeight: 1.1 }}>{val}</div>
          </div>
        ))}
      </div>

      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          position: "relative",
          width: boardSize, height: boardSize,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(224,85,128,0.2)",
          borderRadius: 12, overflow: "hidden",
          boxShadow: "0 0 60px rgba(180,40,100,0.15), inset 0 0 40px rgba(0,0,0,0.4)",
          maxWidth: "90vw", maxHeight: "90vw",
        }}
      >
        <svg style={{ position: "absolute", inset: 0, opacity: 0.04 }} width={boardSize} height={boardSize}>
          {Array.from({ length: GRID + 1 }, (_, i) => (
            <g key={i}>
              <line x1={i * CELL} y1={0} x2={i * CELL} y2={boardSize} stroke="white" strokeWidth="1" />
              <line x1={0} y1={i * CELL} x2={boardSize} y2={i * CELL} stroke="white" strokeWidth="1" />
            </g>
          ))}
        </svg>

        {/* Snake - head is emoji, body segments show collected emojis */}
        {snake.map((seg, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: seg.x * CELL,
              top: seg.y * CELL,

              // 🔥 FIX HERE
              width: seg.emoji ? "auto" : CELL,
              height: seg.emoji ? "auto" : CELL,
              borderRadius: seg.emoji ? 0 : 5,

              background:
                i === 0 || seg.emoji
                  ? "transparent"
                  : `rgba(224,85,128,${Math.max(0.15, 0.4 - i * 0.02)})`,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              fontSize: i === 0 ? 18 : seg.emoji ? 16 : 0,
              pointerEvents: "none",
            }}
          >
            {i === 0 ? "♥️" : seg.emoji || ""}
          </div>
        ))}

        {/* Food */}
        <div style={{
          position: "absolute",
          left: food.x * CELL, top: food.y * CELL,
          width: CELL, height: CELL,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, animation: "foodPulse 1s ease-in-out infinite",
        }}>
          {foodEmojiRef.current}
        </div>

        {/* Particles */}
        {particles.map(p => (
          <div key={p.id} style={{
            position: "absolute",
            left: p.x, top: p.y,
            fontSize: 13, pointerEvents: "none",
            animation: "fadeUp 0.7s ease-out forwards",
          }}>
            {p.emoji}
          </div>
        ))}

        {status !== "playing" && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(13,8,16,0.88)",
            backdropFilter: "blur(4px)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16,
          }}>
            <div style={{ fontSize: "2.5rem" }}>{status === "dead" ? "💔" : "🌹"}</div>
            <div style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 300, textAlign: "center", padding: "0 20px" }}>
              {status === "dead" ? "Game Over" : "Collect hearts,\ndon't break them 💌"}
            </div>
            {status === "dead" && (
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>Score: {score}</div>
            )}
            <button
              onClick={startGame}
              style={{
                marginTop: 8,
                background: "linear-gradient(135deg, #e05580, #8e44ad)",
                border: "none", borderRadius: 50,
                color: "#fff", padding: "12px 32px",
                fontSize: "0.95rem", fontFamily: "Georgia, serif",
                cursor: "pointer", letterSpacing: "0.05em",
              }}
            >
              {status === "dead" ? "Try Again 🌹" : "Start Game 💌"}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 52px)", gridTemplateRows: "repeat(3, 52px)", gap: 6, marginTop: 24 }}>
        <DPadBtn label="↑" col={2} row={1} onClick={() => handleDir({ x: 0, y: -1 })} />
        <DPadBtn label="←" col={1} row={2} onClick={() => handleDir({ x: -1, y: 0 })} />
        <DPadBtn label="→" col={3} row={2} onClick={() => handleDir({ x: 1, y: 0 })} />
        <DPadBtn label="↓" col={2} row={3} onClick={() => handleDir({ x: 0, y: 1 })} />
      </div>
    </div>
  );
}

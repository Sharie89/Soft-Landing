import { useState, useEffect, useRef } from "react";

const C = {
  bg:       "#fdf6ee",
  card:     "#fffbf5",
  terra:    "#c96a45",
  rose:     "#e8957a",
  sage:     "#7d9e8c",
  lavender: "#a89dc0",
  gold:     "#c9993a",
  goldBg:   "#fdf3e1",
  ink:      "#2d2118",
  muted:    "#9e8878",
  soft:     "#f2e8df",
  border:   "#ecddd3",
};

// Replace this with your real Stripe Payment Link when you are ready.
// Example: const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/your-link";
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/bJeeVcfV300rfXv9aNabK02";


// ── Tools config ─────────────────────────────────────────────────
const FREE_TOOLS = [
  { id: "spiral",   emoji: "🌀", label: "I'm spiraling",     sub: "RSD / emotional flood" },
  { id: "conflict", emoji: "💬", label: "After a fight",      sub: "Cool down & reconnect" },
  { id: "remember", emoji: "🗓️", label: "Remember together",  sub: "Things that matter to them" },
  { id: "needs",    emoji: "💛", label: "My needs right now", sub: "Know yourself first" },
];

const PREMIUM_TOOLS = [
  { id: "voice",   emoji: "🎙️", label: "Voice Regulation",    sub: "Guided audio grounding", desc: "A guided voice session that walks you through nervous system regulation — breathing, body scan, and emotional reset. Designed for ADHD overwhelm." },
  { id: "says",    emoji: "💌", label: "What Do I Say?",       sub: "AI message generator",   desc: "Describe what happened and what you want to say. Get calm, clear, ADHD-aware messages to send your partner — no more freezing or word vomit." },
  { id: "pattern", emoji: "📊", label: "Pattern Awareness",   sub: "Track your triggers",     desc: "Log your hard moments over time. Spot when RSD spikes, what triggers conflict, and what actually helps. Insight = less shame." },
];

// ── Spiral data ───────────────────────────────────────────────────
const SPIRAL_STEPS = [
  { icon: "🛑", title: "Pause. You're safe.", body: "Your nervous system is sounding an alarm, but you are physically okay right now. The feeling is real. The threat may not be." },
  { icon: "🫁", title: "Breathe with me.", body: "Breathe in for 4… hold for 4… out for 6. Do this 3 times. Your body needs to know it's not in danger before your brain can think.", breathing: true },
  { icon: "🔍", title: "Name the trigger.", body: "Was it a word, a tone, a silence? Something they did — or something you feared they meant? Write it out. You don't have to share it.", note: true },
  { icon: "🧠", title: "Check the story.", body: "ADHD brains fill gaps fast, often with worst-case stories. Ask yourself: Do I know this is true, or am I guessing? What's one other possible explanation?" },
  { icon: "💛", title: "You're not 'too much.'", body: "You feel deeply. That's also why you love deeply. You are not broken. You are wired differently — and that deserves gentleness, not shame." },
];

const CONFLICT_PROMPTS = [
  "What do I actually need right now — space, reassurance, or to be heard?",
  "What was I trying to say that didn't come out right?",
  "What do I think they were feeling during the argument?",
  "Is there anything I said I want to take back or soften?",
  "What would feel like repair to me? What might feel like repair to them?",
];

const MEMORY_TEMPLATES = [
  "Their love language is…",
  "They feel most hurt when I…",
  "Something they're stressed about right now:",
  "A thing that made them laugh recently:",
  "Their favourite comfort meal:",
  "Something they mentioned wanting to do:",
  "What they need after a hard day:",
];

const NEEDS_LIST = [
  { id: "heard",     label: "To be heard",       emoji: "👂", script: "I don't need you to fix anything — I just need you to listen for a few minutes. Can we do that?" },
  { id: "alone",     label: "Quiet time alone",   emoji: "🌿", script: "I'm not pulling away. I just need to decompress solo for a bit. I'll come find you when I'm back." },
  { id: "reassured", label: "Reassurance",         emoji: "🤍", script: "I'm having a hard brain day. Can you just remind me we're okay?" },
  { id: "touch",     label: "Physical comfort",    emoji: "🫂", script: "I could really use a hug right now — no talking needed." },
  { id: "distract",  label: "Fun distraction",     emoji: "🎲", script: "Can we do something light together? I need to get out of my head." },
  { id: "words",     label: "Kind words",          emoji: "💌", script: "I need to hear something kind right now. Can you tell me something good?" },
  { id: "space",     label: "No demands",          emoji: "☁️", script: "I need a little while with no expectations. It's not about you — I just need to land." },
  { id: "task",      label: "Help with a task",    emoji: "🙌", script: "My brain is stuck. Can you help me with one thing? Just being nearby helps." },
];

// ── Shared UI ─────────────────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", style = {}, disabled = false }) {
  const variants = {
    primary:   { background: C.terra,    color: "#fff" },
    secondary: { background: C.soft,     color: C.ink, border: `1.5px solid ${C.border}` },
    sage:      { background: C.sage,     color: "#fff" },
    gold:      { background: C.gold,     color: "#fff" },
    ghost:     { background: "none",     color: C.muted, padding: "8px 0" },
  };
  return (
    <button disabled={disabled} onClick={onClick} style={{
      border: "none", borderRadius: 14, padding: "13px 20px",
      fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
      fontSize: 15, cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.15s", width: "100%",
      opacity: disabled ? 0.5 : 1,
      ...variants[variant], ...style,
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >{children}</button>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.card, borderRadius: 20, padding: "24px 22px",
      width: "100%", maxWidth: 400,
      boxShadow: `0 2px 32px #c96a4512, 0 1px 0 ${C.border}`,
      ...style
    }}>{children}</div>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
      {title}
      {sub && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.muted, fontWeight: 400, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function BackBtn({ onBack }) {
  return <Btn variant="ghost" onClick={onBack} style={{ marginTop: 4 }}>← Back to home</Btn>;
}

function NoteArea({ placeholder, value, onChange, rows = 3 }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: "100%", borderRadius: 10, border: `1.5px solid ${C.border}`,
        padding: "10px 12px", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
        color: C.ink, background: C.soft, resize: "none",
        minHeight: rows * 28, outline: "none", boxSizing: "border-box",
        transition: "border-color 0.2s",
      }}
      onFocus={e => e.target.style.borderColor = C.terra}
      onBlur={e => e.target.style.borderColor = C.border}
    />
  );
}

// ── Premium Gate Modal ────────────────────────────────────────────
function PremiumGate({ tool, onUnlock, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#2d211888",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 16,
      backdropFilter: "blur(6px)",
      animation: "fadeIn 0.2s ease",
    }}>
      <div style={{
        background: C.card, borderRadius: 24, padding: "32px 28px",
        maxWidth: 380, width: "100%",
        boxShadow: "0 24px 64px #2d211844",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{tool.emoji}</div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 8,
        }}>
          {tool.label}
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: C.goldBg, borderRadius: 20,
          padding: "4px 14px", fontSize: 12,
          color: C.gold, fontWeight: 700,
          marginBottom: 16, border: `1px solid ${C.gold}44`,
        }}>
          ✦ Premium
        </div>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 24 }}>
          {tool.desc}
        </p>

        <div style={{
          background: C.goldBg, borderRadius: 14,
          padding: "16px", marginBottom: 20,
          border: `1px solid ${C.gold}33`,
        }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.gold, fontFamily: "'Playfair Display', serif" }}>
            $6.99 <span style={{ fontSize: 14, fontWeight: 400 }}>/month</span>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            All 3 premium tools · Cancel anytime
          </div>
        </div>

        <Btn variant="gold" onClick={onUnlock} style={{ marginBottom: 10 }}>
          ✦ Unlock Premium Access
        </Btn>
        <Btn variant="ghost" onClick={onClose}>
          Maybe later
        </Btn>
      </div>
    </div>
  );
}

// ── FREE TOOLS ────────────────────────────────────────────────────

function SpiralTool({ onBack }) {
  const [step, setStep] = useState(0);
  const [note, setNote] = useState("");
  const [breathing, setBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState("in");
  const [breathCount, setBreathCount] = useState(0);

  useEffect(() => {
    if (!breathing) return;
    const phases = ["in", "hold", "out"];
    const durations = [4000, 4000, 6000];
    let idx = 0;
    function next() {
      idx = (idx + 1) % 3;
      setBreathPhase(phases[idx]);
      if (idx === 0) setBreathCount(c => c + 1);
      t = setTimeout(next, durations[idx]);
    }
    let t = setTimeout(next, durations[0]);
    return () => clearTimeout(t);
  }, [breathing]);

  const s = SPIRAL_STEPS[step];
  const phaseColors = { in: C.sage, hold: C.lavender, out: C.rose };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", width: "100%", maxWidth: 400 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {SPIRAL_STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 20 : 8, height: 8, borderRadius: 4,
            background: i <= step ? C.terra : C.border, transition: "all 0.3s",
          }} />
        ))}
      </div>
      <Card>
        <div style={{ fontSize: 36, marginBottom: 10 }}>{s.icon}</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 10, lineHeight: 1.3 }}>{s.title}</div>
        <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 16 }}>{s.body}</div>

        {s.breathing && (
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            {!breathing
              ? <Btn variant="sage" onClick={() => setBreathing(true)} style={{ width: "auto", padding: "10px 24px" }}>Start breathing guide</Btn>
              : <div>
                  <div style={{
                    width: 90, height: 90, borderRadius: "50%",
                    background: phaseColors[breathPhase],
                    margin: "0 auto 12px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: 13,
                    transform: breathPhase !== "out" ? "scale(1.3)" : "scale(1)",
                    transition: "all 1.5s ease, background 0.5s",
                    boxShadow: `0 0 28px ${phaseColors[breathPhase]}66`,
                  }}>
                    {breathPhase === "in" ? "breathe in" : breathPhase === "hold" ? "hold" : "breathe out"}
                  </div>
                  <div style={{ fontSize: 13, color: C.muted }}>{breathCount}/3 rounds</div>
                  {breathCount >= 3 && <div style={{ marginTop: 6, fontSize: 13, color: C.sage, fontWeight: 600 }}>✓ Nice. Keep going when ready.</div>}
                </div>
            }
          </div>
        )}

        {s.note && (
          <div style={{ marginBottom: 12 }}>
            <NoteArea placeholder="What triggered this feeling? (just for you)" value={note} onChange={setNote} />
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          {step > 0 && <Btn variant="secondary" onClick={() => setStep(s => s - 1)} style={{ flex: 1 }}>← Back</Btn>}
          {step < SPIRAL_STEPS.length - 1
            ? <Btn onClick={() => setStep(s => s + 1)} style={{ flex: 2 }}>Next →</Btn>
            : <Btn variant="sage" onClick={onBack} style={{ flex: 2 }}>I feel a bit better 🌿</Btn>}
        </div>
      </Card>
      <BackBtn onBack={onBack} />
    </div>
  );
}

function ConflictTool({ onBack }) {
  const [answers, setAnswers] = useState(Array(CONFLICT_PROMPTS.length).fill(""));
  const [ready, setReady] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", width: "100%", maxWidth: 400 }}>
      <Card>
        <SectionHeader title="After the storm 🌧️" sub="Don't rush back in. Write through these first." />
        <div style={{ height: 16 }} />
        {CONFLICT_PROMPTS.map((q, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 6 }}>{q}</div>
            <NoteArea placeholder="write freely…" value={answers[i]} onChange={v => { const a = [...answers]; a[i] = v; setAnswers(a); }} />
          </div>
        ))}

        <div style={{ fontWeight: 600, fontSize: 14, color: C.ink, marginBottom: 10, marginTop: 4 }}>Am I ready to reconnect?</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {["Yes, I'm ready", "Not yet — 20 more min"].map((label, i) => (
            <button key={i} onClick={() => setReady(i === 0)} style={{
              flex: 1, padding: "10px 0", borderRadius: 10,
              border: `2px solid ${ready === (i === 0) ? C.terra : C.border}`,
              background: ready === (i === 0) ? C.terra + "18" : C.soft,
              color: ready === (i === 0) ? C.terra : C.muted,
              fontWeight: 600, fontSize: 13, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
            }}>{label}</button>
          ))}
        </div>
        {ready === true && <div style={{ background: C.sage + "18", borderRadius: 12, padding: 14, fontSize: 14, color: C.sage, lineHeight: 1.6, borderLeft: `3px solid ${C.sage}` }}>
          💛 Try: <em>"I'm not fully okay yet but I want us to be okay. Can we just be close for a bit?"</em>
        </div>}
        {ready === false && <div style={{ background: C.lavender + "18", borderRadius: 12, padding: 14, fontSize: 14, color: C.lavender, lineHeight: 1.6, borderLeft: `3px solid ${C.lavender}` }}>
          🌙 Text them: <em>"I need a little more time. I'm not going anywhere — I just need to land first."</em>
        </div>}
      </Card>
      <BackBtn onBack={onBack} />
    </div>
  );
}

function RememberTool({ onBack }) {
  const [entries, setEntries] = useState(Array(MEMORY_TEMPLATES.length).fill(""));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", width: "100%", maxWidth: 400 }}>
      <Card>
        <SectionHeader title="Things that matter to them 🗓️" sub="Your brain drops things. Write it here so you don't have to hold it." />
        <div style={{ height: 16 }} />
        {MEMORY_TEMPLATES.map((label, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>{label}</div>
            <input value={entries[i]} onChange={e => { const a = [...entries]; a[i] = e.target.value; setEntries(a); }}
              placeholder="add a note…"
              style={{
                width: "100%", borderRadius: 10, border: `1.5px solid ${C.border}`,
                padding: "9px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                color: C.ink, background: C.soft, outline: "none", boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = C.terra}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>
        ))}
        <div style={{ fontSize: 12, color: C.muted, textAlign: "center", marginTop: 8 }}>💾 Screenshot to save between sessions</div>
      </Card>
      <BackBtn onBack={onBack} />
    </div>
  );
}

function NeedsTool({ onBack }) {
  const [selected, setSelected] = useState(null);
  const n = NEEDS_LIST.find(x => x.id === selected);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", width: "100%", maxWidth: 400 }}>
      <Card>
        <SectionHeader title="What do I need right now? 💛" sub="You can't ask for what you need if you don't know first." />
        <div style={{ height: 16 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          {NEEDS_LIST.map(nd => (
            <button key={nd.id} onClick={() => setSelected(nd.id)} style={{
              background: selected === nd.id ? C.terra + "18" : C.soft,
              border: `2px solid ${selected === nd.id ? C.terra : C.border}`,
              borderRadius: 12, padding: "12px 10px", cursor: "pointer",
              textAlign: "left", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif",
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{nd.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{nd.label}</div>
            </button>
          ))}
        </div>
        {n && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>A way to ask for this:</div>
            <div style={{ background: C.terra + "12", borderRadius: 12, padding: "14px 16px", fontSize: 14, color: C.ink, lineHeight: 1.7, borderLeft: `3px solid ${C.terra}`, fontStyle: "italic" }}>
              "{n.script}"
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 10, lineHeight: 1.5 }}>Edit this to fit your relationship. The goal is to name the need clearly — not perfectly.</div>
          </div>
        )}
      </Card>
      <BackBtn onBack={onBack} />
    </div>
  );
}

// ── PREMIUM TOOLS ─────────────────────────────────────────────────

// 🎙️ Voice Regulation
const VOICE_SESSIONS = [
  {
    id: "ground", label: "5-min Grounding", duration: "5 min",
    steps: [
      { dur: 8000,  text: "Close your eyes if you can. Place both feet flat on the floor. Feel the ground beneath you — solid, real, here." },
      { dur: 10000, text: "Notice 3 things you can physically feel right now. The chair beneath you. The air on your skin. Your own heartbeat." },
      { dur: 14000, text: "Breathe in slowly… 1… 2… 3… 4…  Hold… 1… 2… 3… 4…  Breathe out slowly… 1… 2… 3… 4… 5… 6. Again.", breathe: true },
      { dur: 10000, text: "You are not in danger. Your nervous system heard something and reacted. That reaction is not the truth — it's just a signal." },
      { dur: 10000, text: "Say quietly to yourself: I can feel a lot and still be okay. I am allowed to take up space. I am not too much." },
      { dur: 8000,  text: "Take one more slow breath. When you're ready, open your eyes. You landed." },
    ],
  },
  {
    id: "rsd", label: "RSD Reset", duration: "7 min",
    steps: [
      { dur: 8000,  text: "Something happened and it hit hard. That's RSD — rejection sensitive dysphoria. It's real, it's neurological, and it's not your fault." },
      { dur: 12000, text: "Right now your brain is convinced something is deeply wrong. It flooded your body with that certainty. But feelings are not facts." },
      { dur: 14000, text: "Let's breathe through the flood. In for 4… hold for 4… out for 6. Keep your exhale longer than your inhale. This calms the vagus nerve.", breathe: true },
      { dur: 12000, text: "Ask yourself gently: What am I afraid this means? Write it down mentally. Now ask — is there any evidence this is actually true?" },
      { dur: 10000, text: "ADHD women were told their whole lives they were too sensitive, too dramatic, too much. That voice is not the truth. It's an old wound." },
      { dur: 10000, text: "You are someone who loves deeply. That is not a flaw. You just need people who can hold that with you — and that starts with you holding it yourself." },
      { dur: 8000,  text: "Breathe once more. In… and out. You are more regulated than you were 7 minutes ago. That's enough." },
    ],
  },
  {
    id: "sleep", label: "Before Sleep", duration: "4 min",
    steps: [
      { dur: 10000, text: "Whatever happened today — you don't have to solve it tonight. Your relationship is still there in the morning. So are you." },
      { dur: 10000, text: "Let your body get heavy. Soften your jaw. Drop your shoulders. Unclench your hands. You don't have to hold anything right now." },
      { dur: 14000, text: "Breathe slowly… in… and out. Each breath is a small release. You don't have to replay tonight. Just breathe.", breathe: true },
      { dur: 10000, text: "You did something hard today — you felt a lot and you're still here. That counts. Rest now." },
    ],
  },
];

function VoiceTool({ onBack }) {
  const [session, setSession] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [breathPhase, setBreathPhase] = useState("in");
  const timerRef = useRef(null);
  const breathRef = useRef(null);

  const sess = VOICE_SESSIONS.find(s => s.id === session);

  function startSession(id) {
    setSession(id);
    setStepIdx(0);
    setPlaying(true);
  }

  useEffect(() => {
    if (!playing || !sess) return;
    const step = sess.steps[stepIdx];
    if (!step) { setPlaying(false); return; }

    if (step.breathe) {
      const phases = ["in", "hold", "out"];
      const durations = [4000, 4000, 6000];
      let idx = 0;
      setBreathPhase("in");
      function nextPhase() { idx = (idx + 1) % 3; setBreathPhase(phases[idx]); breathRef.current = setTimeout(nextPhase, durations[idx]); }
      breathRef.current = setTimeout(nextPhase, durations[0]);
    }

    timerRef.current = setTimeout(() => {
      clearTimeout(breathRef.current);
      if (stepIdx < sess.steps.length - 1) setStepIdx(i => i + 1);
      else setPlaying(false);
    }, step.dur);

    return () => { clearTimeout(timerRef.current); clearTimeout(breathRef.current); };
  }, [playing, stepIdx, session]);

  function stop() { setPlaying(false); setSession(null); setStepIdx(0); clearTimeout(timerRef.current); clearTimeout(breathRef.current); }

  const phaseColors = { in: C.sage, hold: C.lavender, out: C.rose };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", width: "100%", maxWidth: 400 }}>
      {!session ? (
        <Card>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.goldBg, borderRadius: 20, padding: "3px 12px", fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 12, border: `1px solid ${C.gold}44` }}>✦ Premium</div>
          <SectionHeader title="Voice Regulation 🎙️" sub="Choose a guided session for your moment" />
          <div style={{ height: 16 }} />
          {VOICE_SESSIONS.map(s => (
            <button key={s.id} onClick={() => startSession(s.id)} style={{
              width: "100%", background: C.soft, border: `1.5px solid ${C.border}`,
              borderRadius: 14, padding: "14px 16px", cursor: "pointer",
              textAlign: "left", marginBottom: 10, fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.terra; e.currentTarget.style.background = C.terra + "0e"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.soft; }}
            >
              <div style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>{s.label}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>⏱ {s.duration}</div>
            </button>
          ))}
        </Card>
      ) : (
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            {sess.label} · step {stepIdx + 1}/{sess.steps.length}
          </div>

          {/* Progress bar */}
          <div style={{ background: C.border, borderRadius: 4, height: 4, marginBottom: 20 }}>
            <div style={{ background: C.terra, height: 4, borderRadius: 4, width: `${((stepIdx) / sess.steps.length) * 100}%`, transition: "width 0.5s" }} />
          </div>

          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 400, fontStyle: "italic", color: C.ink, lineHeight: 1.8, minHeight: 100, marginBottom: 24 }}>
            "{sess.steps[stepIdx]?.text}"
          </div>

          {sess.steps[stepIdx]?.breathe && playing && (
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: phaseColors[breathPhase],
                margin: "0 auto",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 12,
                transform: breathPhase !== "out" ? "scale(1.25)" : "scale(1)",
                transition: "all 1.5s ease, background 0.5s",
                boxShadow: `0 0 24px ${phaseColors[breathPhase]}66`,
              }}>
                {breathPhase === "in" ? "breathe in" : breathPhase === "hold" ? "hold" : "breathe out"}
              </div>
            </div>
          )}

          {!playing && stepIdx === sess.steps.length - 1 && (
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🌿</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: C.sage }}>Session complete.</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            {!playing && stepIdx < sess.steps.length - 1 && (
              <Btn onClick={() => setPlaying(true)} style={{ flex: 2 }}>▶ Resume</Btn>
            )}
            <Btn variant="secondary" onClick={stop} style={{ flex: 1 }}>✕ End</Btn>
          </div>
        </Card>
      )}
      <BackBtn onBack={onBack} />
    </div>
  );
}

// 💌 What Do I Say?
const SITUATIONS = [
  "After a fight / argument",
  "I need space but don't want them to feel rejected",
  "I forgot something important",
  "I overreacted and want to repair",
  "I'm overwhelmed and shutting down",
  "I need reassurance but feel needy asking",
  "I said something hurtful I didn't mean",
  "Custom situation…",
];

const TONES = [
  { id: "warm",   label: "Warm & soft" },
  { id: "direct", label: "Direct & clear" },
  { id: "brief",  label: "Short & simple" },
];

function SaysTool({ onBack }) {
  const [situation, setSituation] = useState("");
  const [customSit, setCustomSit] = useState("");
  const [tone, setTone] = useState("warm");
  const [extra, setExtra] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  async function generate() {
    const sit = situation === "Custom situation…" ? customSit : situation;
    if (!sit) return;
    setLoading(true);
    setResult(null);
    setError(null);

    // Launch-safe version: this does NOT call an external AI API from the browser.
    // Later, replace this with a Vercel serverless function that calls Claude/OpenAI securely.
    const toneOpeners = {
      warm: "I care about us and I want to say this gently:",
      direct: "I want to be clear and honest:",
      brief: ""
    };

    const messageMap = {
      "After a fight / argument": "I don't want this to turn into us against each other. I need a little softness, and I want to understand each other better when we're both calmer.",
      "I need space but don't want them to feel rejected": "I'm not pulling away from you. I just need a little quiet time to regulate so I can come back softer instead of overwhelmed.",
      "I forgot something important": "I know I forgot something that mattered, and I'm sorry. It wasn't because I don't care. I want to repair it and do better next time.",
      "I overreacted and want to repair": "I think my nervous system got louder than my actual words. I'm sorry for how it came out. What I really needed was reassurance and calm.",
      "I'm overwhelmed and shutting down": "I'm overwhelmed and I can feel myself shutting down. I don't want to disappear on you — I just need a minute to come back to myself.",
      "I need reassurance but feel needy asking": "I'm having a hard brain moment and could use reassurance. Can you remind me we're okay? I don't need a big conversation, just a little steadiness.",
      "I said something hurtful I didn't mean": "I said something from a flooded place, and I don't want that to be what stands between us. I'm sorry. I want to slow down and repair it."
    };

    const customMessage = "I'm having a hard time finding the words for this, but here's what is happening: " + sit + ". " + (extra ? "The extra context is: " + extra + ". " : "") + "I want to talk about it without turning it into a fight.";
    const baseMessage = messageMap[sit] || customMessage;
    const finalMessage = tone === "brief" ? baseMessage : toneOpeners[tone] + " " + baseMessage;

    window.setTimeout(() => {
      setResult({
        message: finalMessage,
        note: "Send it when your body feels calmer, not at the peak of the spiral."
      });
      setLoading(false);
    }, 500);
  }

  function copy() {
    if (result?.message) { navigator.clipboard.writeText(result.message); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", width: "100%", maxWidth: 400 }}>
      <Card>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.goldBg, borderRadius: 20, padding: "3px 12px", fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 12, border: `1px solid ${C.gold}44` }}>✦ Premium · AI-Powered</div>
        <SectionHeader title="What do I say? 💌" sub="Describe what's happening — get a message you can actually send." />
        <div style={{ height: 16 }} />

        {/* Situation picker */}
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>What's the situation?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
          {SITUATIONS.map(s => (
            <button key={s} onClick={() => setSituation(s)} style={{
              background: situation === s ? C.terra + "18" : C.soft,
              border: `1.5px solid ${situation === s ? C.terra : C.border}`,
              borderRadius: 10, padding: "9px 14px",
              cursor: "pointer", fontSize: 13,
              color: situation === s ? C.terra : C.ink,
              textAlign: "left", fontFamily: "'DM Sans', sans-serif",
              fontWeight: situation === s ? 700 : 400,
              transition: "all 0.12s",
            }}>{s}</button>
          ))}
        </div>

        {situation === "Custom situation…" && (
          <div style={{ marginBottom: 14 }}>
            <NoteArea placeholder="Describe what happened…" value={customSit} onChange={setCustomSit} rows={3} />
          </div>
        )}

        {/* Tone */}
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Tone</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {TONES.map(t => (
            <button key={t.id} onClick={() => setTone(t.id)} style={{
              flex: 1, padding: "8px 0", borderRadius: 10,
              border: `2px solid ${tone === t.id ? C.terra : C.border}`,
              background: tone === t.id ? C.terra + "18" : C.soft,
              color: tone === t.id ? C.terra : C.muted,
              fontWeight: 600, fontSize: 12, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.12s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Extra context */}
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Anything else? (optional)</div>
        <div style={{ marginBottom: 18 }}>
          <NoteArea placeholder="e.g. we've been together 2 years, they're sensitive about X…" value={extra} onChange={setExtra} rows={2} />
        </div>

        <Btn onClick={generate} disabled={!situation || (situation === "Custom situation…" && !customSit) || loading}>
          {loading ? "Writing…" : "✦ Generate message"}
        </Btn>

        {error && <div style={{ marginTop: 12, fontSize: 13, color: C.rose, textAlign: "center" }}>{error}</div>}

        {result && (
          <div style={{ marginTop: 20, animation: "fadeIn 0.4s ease" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Your message:</div>
            <div style={{
              background: C.goldBg, borderRadius: 14, padding: "16px",
              fontSize: 15, color: C.ink, lineHeight: 1.8,
              borderLeft: `3px solid ${C.gold}`, marginBottom: 10,
            }}>
              {result.message}
            </div>
            {result.note && (
              <div style={{ fontSize: 12, color: C.sage, marginBottom: 14, lineHeight: 1.5, fontStyle: "italic" }}>
                💛 {result.note}
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={copy} variant="secondary" style={{ flex: 1 }}>{copied ? "✓ Copied!" : "Copy"}</Btn>
              <Btn onClick={generate} style={{ flex: 2 }} disabled={loading}>{loading ? "…" : "Try again"}</Btn>
            </div>
          </div>
        )}
      </Card>
      <BackBtn onBack={onBack} />
    </div>
  );
}

// 📊 Pattern Awareness
const TRIGGER_TYPES = ["RSD spike", "Argument", "Shutdown", "Overwhelm", "Guilt spiral", "Rejection fear"];
const HELPED_LIST = ["Breathing", "Alone time", "Talking it out", "Physical comfort", "Walking", "Crying", "Writing", "Nothing yet"];

function PatternTool({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], trigger: "", intensity: 3, helped: [], note: "" });
  const [view, setView] = useState("log"); // log | history

  function addLog() {
    if (!form.trigger) return;
    setLogs(l => [{ ...form, id: Date.now() }, ...l]);
    setForm({ date: new Date().toISOString().split("T")[0], trigger: "", intensity: 3, helped: [], note: "" });
    setView("history");
  }

  function toggleHelped(h) {
    setForm(f => ({ ...f, helped: f.helped.includes(h) ? f.helped.filter(x => x !== h) : [...f.helped, h] }));
  }

  // Pattern summary
  const topTrigger = logs.length ? logs.reduce((acc, l) => { acc[l.trigger] = (acc[l.trigger] || 0) + 1; return acc; }, {}) : null;
  const mostCommon = topTrigger ? Object.entries(topTrigger).sort((a, b) => b[1] - a[1])[0] : null;
  const avgIntensity = logs.length ? (logs.reduce((s, l) => s + l.intensity, 0) / logs.length).toFixed(1) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", width: "100%", maxWidth: 400 }}>
      <Card>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.goldBg, borderRadius: 20, padding: "3px 12px", fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 12, border: `1px solid ${C.gold}44` }}>✦ Premium</div>
        <SectionHeader title="Pattern Awareness 📊" sub="Spot what triggers you. Spot what helps." />

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, background: C.soft, borderRadius: 10, padding: 3, margin: "14px 0" }}>
          {["log", "history"].map(t => (
            <button key={t} onClick={() => setView(t)} style={{
              flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
              background: view === t ? C.card : "transparent",
              color: view === t ? C.terra : C.muted,
              fontWeight: 700, fontSize: 13, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: view === t ? "0 1px 4px #c96a4520" : "none",
              transition: "all 0.15s",
            }}>
              {t === "log" ? "Add entry" : `History (${logs.length})`}
            </button>
          ))}
        </div>

        {view === "log" && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>What happened?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {TRIGGER_TYPES.map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, trigger: t }))} style={{
                  padding: "6px 12px", borderRadius: 20,
                  border: `1.5px solid ${form.trigger === t ? C.terra : C.border}`,
                  background: form.trigger === t ? C.terra + "18" : C.soft,
                  color: form.trigger === t ? C.terra : C.muted,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", transition: "all 0.12s",
                }}>{t}</button>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
              Intensity: {form.intensity}/5
            </div>
            <input type="range" min={1} max={5} value={form.intensity}
              onChange={e => setForm(f => ({ ...f, intensity: +e.target.value }))}
              style={{ width: "100%", accentColor: C.terra, marginBottom: 14, cursor: "pointer" }}
            />

            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>What helped? (if anything)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {HELPED_LIST.map(h => (
                <button key={h} onClick={() => toggleHelped(h)} style={{
                  padding: "5px 11px", borderRadius: 20,
                  border: `1.5px solid ${form.helped.includes(h) ? C.sage : C.border}`,
                  background: form.helped.includes(h) ? C.sage + "18" : C.soft,
                  color: form.helped.includes(h) ? C.sage : C.muted,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", transition: "all 0.12s",
                }}>{h}</button>
              ))}
            </div>

            <NoteArea placeholder="Optional note…" value={form.note} onChange={v => setForm(f => ({ ...f, note: v }))} rows={2} />
            <div style={{ marginTop: 14 }}>
              <Btn onClick={addLog} disabled={!form.trigger}>Save entry</Btn>
            </div>
          </div>
        )}

        {view === "history" && (
          <div>
            {logs.length === 0 ? (
              <div style={{ textAlign: "center", color: C.muted, fontSize: 14, padding: "24px 0" }}>
                No entries yet. Log your first moment.
              </div>
            ) : (
              <div>
                {/* Summary */}
                {logs.length >= 2 && (
                  <div style={{ background: C.goldBg, borderRadius: 12, padding: "12px 16px", marginBottom: 16, border: `1px solid ${C.gold}33` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, marginBottom: 6 }}>✦ Pattern snapshot</div>
                    <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.7 }}>
                      Most common trigger: <strong>{mostCommon?.[0]}</strong> ({mostCommon?.[1]}x)<br />
                      Average intensity: <strong>{avgIntensity}/5</strong>
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {logs.map(l => (
                    <div key={l.id} style={{ background: C.soft, borderRadius: 12, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{l.trigger}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{l.date}</div>
                      </div>
                      <div style={{ fontSize: 12, color: C.muted }}>
                        Intensity {l.intensity}/5 {l.helped.length > 0 && `· Helped: ${l.helped.join(", ")}`}
                      </div>
                      {l.note && <div style={{ fontSize: 12, color: C.muted, marginTop: 4, fontStyle: "italic" }}>{l.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
      <BackBtn onBack={onBack} />
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────
export default function SoftLanding() {
  const [section, setSection] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [gateFor, setGateFor] = useState(null); // which premium tool they tapped

  function handlePremiumTap(tool) {
    if (isPremium) { setSection(tool.id); }
    else { setGateFor(tool); }
  }

  function unlock() {
    if (STRIPE_PAYMENT_LINK) {
      window.location.href = STRIPE_PAYMENT_LINK;
      return;
    }
    // Temporary preview mode until you add your Stripe Payment Link above.
    setIsPremium(true);
    setSection(gateFor.id);
    setGateFor(null);
  }

  const activeTool = [...FREE_TOOLS, ...PREMIUM_TOOLS].find(t => t.id === section);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", padding: "36px 16px 56px",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap" rel="stylesheet" />

      <div style={{ position:"fixed", top:-100, right:-80, width:340, height:340, borderRadius:"50%", background:`radial-gradient(circle, ${C.rose}20, transparent 70%)`, pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:-80, left:-60, width:260, height:260, borderRadius:"50%", background:`radial-gradient(circle, ${C.sage}18, transparent 70%)`, pointerEvents:"none" }} />

      {/* Gate modal */}
      {gateFor && <PremiumGate tool={gateFor} onUnlock={unlock} onClose={() => setGateFor(null)} />}

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: section ? 20 : 32, maxWidth: 400, width: "100%" }}>
        {isPremium && !section && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.goldBg, borderRadius: 20, padding: "3px 14px", fontSize: 11, color: C.gold, fontWeight: 700, marginBottom: 10, border: `1px solid ${C.gold}44` }}>✦ Premium</div>
        )}
        <div style={{ fontSize: 11, letterSpacing: 5, color: C.muted, textTransform: "uppercase", marginBottom: 4 }}>
          {section ? (activeTool?.emoji + " " + activeTool?.label) : "for ADHD women"}
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 6vw, 40px)", fontWeight: 700, color: C.ink, margin: 0, lineHeight: 1.15 }}>
          Soft Landing
        </h1>
        {!section && <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: "8px 0 0" }}>Your relationship isn't the problem.<br />Your brain just needs different tools.</p>}
      </div>

      {/* HOME */}
      {!section && (
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Free tools */}
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Free tools</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            {FREE_TOOLS.map(t => (
              <button key={t.id} onClick={() => setSection(t.id)} style={{
                background: C.card, border: `1.5px solid ${C.border}`,
                borderRadius: 18, padding: "16px 20px", cursor: "pointer",
                textAlign: "left", display: "flex", alignItems: "center", gap: 14,
                transition: "all 0.15s", boxShadow: "0 2px 12px #c96a4508",
                fontFamily: "'DM Sans', sans-serif",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.terra; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <span style={{ fontSize: 28 }}>{t.emoji}</span>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: C.ink }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{t.sub}</div>
                </div>
                <div style={{ marginLeft: "auto", color: C.border, fontSize: 18 }}>›</div>
              </button>
            ))}
          </div>

          {/* Premium tools */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Premium tools</div>
            <div style={{ fontSize: 11, color: C.gold, fontWeight: 700 }}>✦ $6.99/mo</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            {PREMIUM_TOOLS.map(t => (
              <button key={t.id} onClick={() => handlePremiumTap(t)} style={{
                background: isPremium ? C.card : C.goldBg,
                border: `1.5px solid ${isPremium ? C.border : C.gold + "55"}`,
                borderRadius: 18, padding: "16px 20px", cursor: "pointer",
                textAlign: "left", display: "flex", alignItems: "center", gap: 14,
                transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif",
                position: "relative", overflow: "hidden",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = isPremium ? C.border : C.gold + "55"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <span style={{ fontSize: 28 }}>{t.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: C.ink }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{t.sub}</div>
                </div>
                {!isPremium && (
                  <div style={{ background: C.gold, color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 8, letterSpacing: 0.5 }}>UNLOCK</div>
                )}
                {isPremium && <div style={{ color: C.border, fontSize: 18 }}>›</div>}
              </button>
            ))}
          </div>

          <div style={{ padding: "16px 20px", background: C.terra + "0d", borderRadius: 16, border: `1px dashed ${C.terra}44` }}>
            <div style={{ fontSize: 13, color: C.terra, fontWeight: 600, marginBottom: 4 }}>📌 Remember</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>ADHD affects emotional regulation, memory, and impulsivity — all core to relationships. This isn't about trying harder. It's about trying differently.</div>
          </div>
        </div>
      )}

      {/* Tool views */}
      {section === "spiral"   && <SpiralTool   onBack={() => setSection(null)} />}
      {section === "conflict" && <ConflictTool onBack={() => setSection(null)} />}
      {section === "remember" && <RememberTool onBack={() => setSection(null)} />}
      {section === "needs"    && <NeedsTool    onBack={() => setSection(null)} />}
      {section === "voice"    && <VoiceTool    onBack={() => setSection(null)} />}
      {section === "says"     && <SaysTool     onBack={() => setSection(null)} />}
      {section === "pattern"  && <PatternTool  onBack={() => setSection(null)} />}

      <div style={{ marginTop: 24, fontSize: 12, color: C.border, textAlign: "center" }}>private · nothing stored · just for you</div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        button:active { transform: scale(0.98) !important; }
        textarea:focus, input[type=text]:focus { border-color: ${C.terra} !important; }
      `}</style>
    </div>
  );
}
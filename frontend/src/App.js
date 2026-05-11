import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Rnd } from "react-rnd";
import LoginModal from "./LoginModal";

const API_BASE_URL = "http://127.0.0.1:8000";

// ── Star field background ──────────────────────────────────────────
function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.2,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.15 + 0.03,
    }));

    let animId;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fill();

        s.alpha += Math.sin(Date.now() * s.speed * 0.01) * 0.004;
        s.alpha = Math.max(0.1, Math.min(0.9, s.alpha));
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.55,
      }}
    />
  );
}

function NebulaRing({ size = 320, opacity = 0.08 }) {
  return (
    <svg
      width={size}
      height={size}
      style={{ position: "absolute", pointerEvents: "none", opacity }}
      viewBox="0 0 320 320"
    >
      <circle cx="160" cy="160" r="140" fill="none" stroke="#FF6B1A" strokeWidth="1" />
      <circle cx="160" cy="160" r="110" fill="none" stroke="#FF6B1A" strokeWidth="0.5" />
      <circle cx="160" cy="160" r="75" fill="none" stroke="#FF8C42" strokeWidth="1.5" />
      <ellipse
        cx="160"
        cy="160"
        rx="155"
        ry="55"
        fill="none"
        stroke="#FF6B1A"
        strokeWidth="0.5"
        transform="rotate(-30 160 160)"
      />
    </svg>
  );
}

function GlowDot({ color = "#FF6B1A", size = 6 }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 8px 2px ${color}55`,
        marginRight: 8,
        flexShrink: 0,
      }}
    />
  );
}

function Cursor() {
  const [vis, setVis] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setVis((v) => !v), 530);
    return () => clearInterval(t);
  }, []);

  return <span style={{ opacity: vis ? 1 : 0, color: "#FF6B1A" }}>▌</span>;
}

function OrbitLoader({ color = "#FF6B1A" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20">
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="40"
          strokeDashoffset="30"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 10 10"
            to="360 10 10"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>

        <circle cx="10" cy="2" r="2" fill={color}>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 10 10"
            to="360 10 10"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </span>
  );
}

// ── Draggable result panel ──────────────────────────────────────────
function ResultPanel({
  id,
  label,
  icon,
  accent,
  content,
  isLoading,
  isMinimized,
  onMinimize,
  onRestore,
  onClear,
  onCopy,
  onDownload,
  layout,
  onLayoutChange,
  bounds = "parent",
  zIndex = 2,
  onBringToFront,
}) {
  if (!content && !isLoading) return null;

  if (isMinimized) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${accent}33`,
          borderRadius: 16,
          padding: "12px 16px",
          position: "relative",
          overflow: "hidden",
          minHeight: 60,
          minWidth: 260,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: accent,
            opacity: 0.7,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: accent,
              }}
            >
              {label}
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => onCopy(id)} style={miniBtn(accent)}>
              Copy
            </button>

            <button onClick={() => onDownload(id)} style={darkBtn}>
              Download
            </button>

            <button onClick={() => onRestore(id)} style={miniBtn(accent)}>
              Restore
            </button>

            <button onClick={() => onClear(id)} style={deleteBtn}>
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Rnd
      bounds={bounds}
      onMouseDown={() => onBringToFront && onBringToFront(id)}
      size={{ width: layout.width, height: layout.height }}
      position={{ x: layout.x, y: layout.y }}
      minWidth={320}
      minHeight={220}
      onDragStop={(e, d) => {
        onLayoutChange(id, { x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        onLayoutChange(id, {
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
          x: position.x,
          y: position.y,
        });
      }}
      style={{ zIndex }}
      dragHandleClassName={`drag-handle-${id}`}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${accent}33`,
          borderRadius: 16,
          padding: "20px 24px",
          position: "relative",
          overflow: "hidden",
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
          backdropFilter: "blur(6px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: accent,
            opacity: 0.7,
          }}
        />

        <div
          className={`drag-handle-${id}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 14,
            cursor: "move",
            paddingRight: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: accent,
              }}
            >
              {label}
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => onCopy(id)} style={miniBtn(accent)}>
              Copy
            </button>

            <button onClick={() => onDownload(id)} style={darkBtn}>
              Download
            </button>

            <button onClick={() => onMinimize(id)} style={darkBtn}>
              Minimize
            </button>

            <button onClick={() => onClear(id)} style={deleteBtn}>
              Delete
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#aaa", fontSize: 14 }}>
            <OrbitLoader color={accent} />
            <span>Generating {label.toLowerCase()}…</span>
          </div>
        ) : (
          <div style={{ overflowY: "auto", height: "calc(100% - 48px)", paddingRight: 8 }}>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 13.5,
                lineHeight: 1.75,
                color: "#E2E8F0",
                margin: 0,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
            >
              {content}
            </pre>
          </div>
        )}
      </div>
    </Rnd>
  );
}

function ActionBtn({ onClick, color, icon, label, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 18px",
        borderRadius: 10,
        background: `${color}18`,
        border: `1px solid ${color}55`,
        color,
        fontSize: 13,
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        letterSpacing: "0.04em",
        opacity: loading ? 0.5 : 1,
        whiteSpace: "nowrap",
      }}
    >
      {loading ? <OrbitLoader color={color} /> : <span style={{ fontSize: 15 }}>{icon}</span>}
      {label}
    </button>
  );
}

function ChatMessage({ role, text }) {
  const isUser = role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 12,
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FF6B1A, #FF3D00)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            marginRight: 10,
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          ✦
        </div>
      )}

      <div
        style={{
          maxWidth: "78%",
          background: isUser ? "rgba(255,107,26,0.15)" : "rgba(255,255,255,0.05)",
          border: isUser
            ? "1px solid rgba(255,107,26,0.4)"
            : "1px solid rgba(255,255,255,0.08)",
          borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
          padding: "10px 14px",
          fontSize: 13.5,
          lineHeight: 1.7,
          color: isUser ? "#FFB899" : "#E2E8F0",
        }}
      >
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
          {text}
        </pre>
      </div>
    </div>
  );
}

export default function App() {
  const [files, setFiles] = useState([]);

  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [mcqs, setMcqs] = useState("");
  const [questionBank, setQuestionBank] = useState("");
  const [advancedQuestions, setAdvancedQuestions] = useState("");

  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [loadingState, setLoadingState] = useState({});

  const [activePanels, setActivePanels] = useState([]);
  const [minimizedPanels, setMinimizedPanels] = useState([]);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState(null);
  const [savedNotes, setSavedNotes] = useState([]);

  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(30);

  const [panelLayouts, setPanelLayouts] = useState({
    summary: { x: 20, y: 20, width: 420, height: 360 },
    notes: { x: 20, y: 20, width: 420, height: 360 },
    questionBank: { x: 20, y: 20, width: 420, height: 360 },
    advancedQuestions: { x: 20, y: 20, width: 420, height: 360 },
    mcqs: { x: 20, y: 20, width: 420, height: 360 },
  });

  const [panelZIndexes, setPanelZIndexes] = useState({
    summary: 2,
    notes: 2,
    questionBank: 2,
    advancedQuestions: 2,
    mcqs: 2,
  });

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedNotes = localStorage.getItem("savedNotes");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    if (storedNotes) {
      try {
        setSavedNotes(JSON.parse(storedNotes));
      } catch {
        localStorage.removeItem("savedNotes");
      }
    }

    localStorage.removeItem("guestMode");

    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");
      if (!token) setShowLoginModal(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const setLoading = (key, val) => {
    setLoadingState((s) => ({
      ...s,
      [key]: val,
    }));
  };

  const requireLogin = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setShowLoginModal(true);
      return false;
    }

    return true;
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    if (!token) return {};

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("guestMode");

    setUser(null);
    setShowLoginModal(true);
  };

  const updatePanelLayout = (panelId, newLayout) => {
    setPanelLayouts((prev) => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        ...newLayout,
      },
    }));
  };

  const panelSlots = [
    { x: 20, y: 20, width: 420, height: 360 },
    { x: 470, y: 20, width: 420, height: 360 },
  ];

  const bringPanelToFront = (panelId) => {
    setPanelZIndexes((prev) => {
      const highestZ = Math.max(...Object.values(prev));
      return {
        ...prev,
        [panelId]: highestZ + 1,
      };
    });
  };

  const movePanelToSlot = (panelId, slotIndex) => {
    const slot = panelSlots[slotIndex] || panelSlots[0];

    setPanelLayouts((prev) => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        ...slot,
      },
    }));
  };

  const resetPanelLayout = () => {
    setPanelLayouts((prev) => {
      const updatedLayouts = { ...prev };

      activePanels.forEach((panelId, index) => {
        const slot = panelSlots[index] || panelSlots[0];

        updatedLayouts[panelId] = {
          ...updatedLayouts[panelId],
          ...slot,
        };
      });

      return updatedLayouts;
    });
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    const allowedExtensions = ["pdf", "docx", "txt", "png", "jpg", "jpeg", "webp"];
    const fileName = selectedFile.name.toLowerCase();
    const fileExtension = fileName.split(".").pop();

    if (!allowedExtensions.includes(fileExtension)) {
      alert("Invalid file type. Please upload only PDF, DOCX, TXT, PNG, JPG, JPEG, or WEBP files.");
      return false;
    }

    return true;
  };

  const createFormData = () => {
    const fd = new FormData();

    files.forEach((file) => {
      fd.append("files", file);
    });

    return fd;
  };

  const openPanel = (panelId) => {
    setMinimizedPanels((prev) => prev.filter((id) => id !== panelId));

    setActivePanels((prev) => {
      if (prev.includes(panelId)) {
        bringPanelToFront(panelId);
        return prev;
      }

      if (prev.length >= 2) {
        const shouldMinimize = window.confirm(
          "Only 2 result sections can be open at the same time. Do you want to minimize the oldest section and open this one?"
        );

        if (!shouldMinimize) return prev;

        const oldestPanel = prev[0];
        const remainingPanel = prev[1];

        setMinimizedPanels((minPrev) => {
          if (minPrev.includes(oldestPanel)) return minPrev;
          return [...minPrev, oldestPanel];
        });

        movePanelToSlot(remainingPanel, 0);
        movePanelToSlot(panelId, 1);
        bringPanelToFront(panelId);

        return [remainingPanel, panelId];
      }

      const newSlotIndex = prev.length;
      movePanelToSlot(panelId, newSlotIndex);
      bringPanelToFront(panelId);

      return [...prev, panelId];
    });
  };

  const copyPanelContent = async (panelId) => {
    let textToCopy = "";

    if (panelId === "summary") textToCopy = summary;
    if (panelId === "notes") textToCopy = notes;
    if (panelId === "questionBank") textToCopy = questionBank;
    if (panelId === "advancedQuestions") textToCopy = advancedQuestions;
    if (panelId === "mcqs") textToCopy = mcqs;

    if (!textToCopy) return alert("Nothing to copy.");

    try {
      await navigator.clipboard.writeText(textToCopy);
      alert("Copied to clipboard!");
    } catch {
      alert("Could not copy the text.");
    }
  };

  const downloadPanelContent = (panelId) => {
    let textToDownload = "";
    let fileName = "";

    if (panelId === "summary") {
      textToDownload = summary;
      fileName = "summary.txt";
    }

    if (panelId === "notes") {
      textToDownload = notes;
      fileName = "important_notes.txt";
    }

    if (panelId === "questionBank") {
      textToDownload = questionBank;
      fileName = "exam_questions.txt";
    }

    if (panelId === "advancedQuestions") {
      textToDownload = advancedQuestions;
      fileName = "advanced_questions.txt";
    }

    if (panelId === "mcqs") {
      textToDownload = mcqs;
      fileName = "mcqs.txt";
    }

    if (!textToDownload) return alert("Nothing to download.");

    const blob = new Blob([textToDownload], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const minimizePanel = (panelId) => {
    setMinimizedPanels((prev) => {
      if (prev.includes(panelId)) return prev;
      return [...prev, panelId];
    });

    setActivePanels((prev) => prev.filter((id) => id !== panelId));
  };

  const restorePanel = (panelId) => {
    openPanel(panelId);
  };

  const clearPanel = (panelId) => {
    const confirmDelete = window.confirm("Do you want to delete this generated result?");
    if (!confirmDelete) return;

    if (panelId === "summary") setSummary("");
    if (panelId === "notes") setNotes("");
    if (panelId === "questionBank") setQuestionBank("");
    if (panelId === "advancedQuestions") setAdvancedQuestions("");
    if (panelId === "mcqs") setMcqs("");

    setActivePanels((prev) => prev.filter((id) => id !== panelId));
    setMinimizedPanels((prev) => prev.filter((id) => id !== panelId));
  };

  const clearAllResults = () => {
    const confirmClear = window.confirm("Do you want to delete all generated results?");
    if (!confirmClear) return;

    setSummary("");
    setNotes("");
    setMcqs("");
    setQuestionBank("");
    setAdvancedQuestions("");

    setActivePanels([]);
    setMinimizedPanels([]);
  };

  const resetAllGeneratedOutputs = () => {
    setSummary("");
    setNotes("");
    setMcqs("");
    setQuestionBank("");
    setAdvancedQuestions("");
    setChatHistory([]);
    setActivePanels([]);
    setMinimizedPanels([]);

    setPanelLayouts({
      summary: { x: 20, y: 20, width: 420, height: 360 },
      notes: { x: 20, y: 20, width: 420, height: 360 },
      questionBank: { x: 20, y: 20, width: 420, height: 360 },
      advancedQuestions: { x: 20, y: 20, width: 420, height: 360 },
      mcqs: { x: 20, y: 20, width: 420, height: 360 },
    });

    setPanelZIndexes({
      summary: 2,
      notes: 2,
      questionBank: 2,
      advancedQuestions: 2,
      mcqs: 2,
    });
  };

  const saveGeneratedNote = (type, content) => {
    if (!content || !content.trim()) {
      alert("Nothing to save.");
      return;
    }

    const newNote = {
      id: Date.now(),
      type,
      title: `${type} - ${new Date().toLocaleString()}`,
      content,
      date: new Date().toLocaleString(),
    };

    const updatedNotes = [newNote, ...savedNotes];

    setSavedNotes(updatedNotes);
    localStorage.setItem("savedNotes", JSON.stringify(updatedNotes));

    alert("Saved to notes.");
  };

  const openSavedNote = (note) => {
    if (note.type === "Summary") {
      setSummary(note.content);
      openPanel("summary");
    } else if (note.type === "Important Notes") {
      setNotes(note.content);
      openPanel("notes");
    } else if (note.type === "Fast Notes") {
      setNotes(note.content);
      openPanel("notes");
    } else if (note.type === "MCQs") {
      setMcqs(note.content);
      openPanel("mcqs");
    } else if (note.type === "Exam Questions") {
      setQuestionBank(note.content);
      openPanel("questionBank");
    } else if (note.type === "Advanced Questions") {
      setAdvancedQuestions(note.content);
      openPanel("advancedQuestions");
    }
  };

  const deleteSavedNote = (id) => {
    const updatedNotes = savedNotes.filter((note) => note.id !== id);

    setSavedNotes(updatedNotes);
    localStorage.setItem("savedNotes", JSON.stringify(updatedNotes));
  };

  const handleFastNotes = async () => {
    if (!requireLogin()) return;
    if (files.length === 0) return alert("Upload at least one file first");

    setLoading("fastNotes", true);
    openPanel("notes");

    const fd = new FormData();

    files.forEach((file) => {
      fd.append("files", file);
    });

    fd.append("start_page", startPage);
    fd.append("end_page", endPage);

    try {
      const res = await axios.post(`${API_BASE_URL}/generate-notes-fast`, fd, {
        headers: getAuthHeaders(),
      });

      setNotes(res.data.notes);
      openPanel("notes");
    } catch (err) {
      if (err.response?.status === 401) setShowLoginModal(true);
      alert(err.response?.data?.error || "Fast Notes Error");
    }

    setLoading("fastNotes", false);
  };

  const handleSummary = async () => {
    if (!requireLogin()) return;
    if (files.length === 0) return alert("Upload at least one file first");

    setLoading("summary", true);
    openPanel("summary");

    try {
      const res = await axios.post(`${API_BASE_URL}/generate-summary`, createFormData(), {
        headers: getAuthHeaders(),
      });

      setSummary(res.data.summary);
      openPanel("summary");
    } catch (err) {
      if (err.response?.status === 401) setShowLoginModal(true);
      alert("Summary Error");
    }

    setLoading("summary", false);
  };

  const handleNotes = async () => {
    if (!requireLogin()) return;
    if (files.length === 0) return alert("Upload at least one file first");

    setLoading("notes", true);
    openPanel("notes");

    try {
      const res = await axios.post(`${API_BASE_URL}/generate-notes`, createFormData(), {
        headers: getAuthHeaders(),
      });

      setNotes(res.data.notes);
      openPanel("notes");
    } catch (err) {
      if (err.response?.status === 401) setShowLoginModal(true);
      alert("Important Notes Error");
    }

    setLoading("notes", false);
  };

  const handleMCQ = async () => {
    if (!requireLogin()) return;
    if (files.length === 0) return alert("Upload at least one file first");

    setLoading("mcq", true);
    openPanel("mcqs");

    try {
      const res = await axios.post(`${API_BASE_URL}/generate-mcq`, createFormData(), {
        headers: getAuthHeaders(),
      });

      setMcqs(res.data.mcqs);
      openPanel("mcqs");
    } catch (err) {
      if (err.response?.status === 401) setShowLoginModal(true);
      alert("MCQ Error");
    }

    setLoading("mcq", false);
  };

  const handleQuestions = async () => {
    if (!requireLogin()) return;
    if (files.length === 0) return alert("Upload at least one file first");

    setLoading("qbank", true);
    openPanel("questionBank");

    try {
      const res = await axios.post(`${API_BASE_URL}/generate-questions`, createFormData(), {
        headers: getAuthHeaders(),
      });

      setQuestionBank(res.data.questions);
      openPanel("questionBank");
    } catch (err) {
      if (err.response?.status === 401) setShowLoginModal(true);
      alert("Exam Questions Error");
    }

    setLoading("qbank", false);
  };

  const handleAdvancedQuestions = async () => {
    if (!requireLogin()) return;
    if (files.length === 0) return alert("Upload at least one file first");

    setLoading("advancedQuestions", true);
    openPanel("advancedQuestions");

    try {
      const res = await axios.post(`${API_BASE_URL}/generate-advanced-questions`, createFormData(), {
        headers: getAuthHeaders(),
      });

      setAdvancedQuestions(res.data.advanced_questions);
      openPanel("advancedQuestions");
    } catch (err) {
      if (err.response?.status === 401) setShowLoginModal(true);
      alert("Advanced Questions Error");
    }

    setLoading("advancedQuestions", false);
  };

  const handleChat = async () => {
    if (!requireLogin()) return;
    if (!question.trim()) return alert("Ask a question first");

    const userMsg = question.trim();

    setChatHistory((h) => [...h, { role: "user", text: userMsg }]);
    setQuestion("");
    setLoading("chat", true);

    const fd = new FormData();

    files.forEach((file) => {
      fd.append("files", file);
    });

    fd.append("question", userMsg);

    try {
      const res = await axios.post(`${API_BASE_URL}/chat`, fd, {
        headers: getAuthHeaders(),
      });

      setChatHistory((h) => [
        ...h,
        {
          role: "ai",
          text: res.data.answer,
        },
      ]);
    } catch (err) {
      if (err.response?.status === 401) setShowLoginModal(true);

      setChatHistory((h) => [
        ...h,
        {
          role: "ai",
          text: "⚠ Could not connect to backend or login is required.",
        },
      ]);
    }

    setLoading("chat", false);

    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length === 0) return;

    const validFiles = selectedFiles.filter((file) => validateFile(file));

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    setFiles((prevFiles) => {
      const existingNames = prevFiles.map((file) => file.name);

      const newFiles = validFiles.filter(
        (file) => !existingNames.includes(file.name)
      );

      return [...prevFiles, ...newFiles];
    });

    resetAllGeneratedOutputs();
    e.target.value = "";
  };

  const removeFile = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    resetAllGeneratedOutputs();
  };

  const anyLoading = Object.values(loadingState).some(Boolean);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080B14",
        color: "#E2E8F0",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLoginSuccess}
        />
      )}

      <StarField />

      <style>
        {`
          input::placeholder {
            color: #CBD5E1;
            opacity: 1;
          }
        `}
      </style>

      <aside
        style={{
          position: "fixed",
          left: 16,
          top: 20,
          bottom: 20,
          width: 260,
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,107,26,0.22)",
          borderRadius: 18,
          padding: 16,
          zIndex: 3,
          overflowY: "auto",
          backdropFilter: "blur(8px)",
        }}
      >
        <h3
          style={{
            margin: "0 0 14px",
            color: "#FF8C42",
            fontSize: 16,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Saved Notes
        </h3>

        <button onClick={() => saveGeneratedNote("Fast Notes", notes)} style={saveBtn}>
          Save Current Notes
        </button>

        <button onClick={() => saveGeneratedNote("Summary", summary)} style={saveBtnBlue}>
          Save Summary
        </button>

        <button onClick={() => saveGeneratedNote("MCQs", mcqs)} style={saveBtnOrange}>
          Save MCQs
        </button>

        {savedNotes.length === 0 ? (
          <p style={{ color: "#64748B", fontSize: 13 }}>No saved notes yet.</p>
        ) : (
          savedNotes.map((note) => (
            <div
              key={note.id}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: 10,
                marginBottom: 10,
              }}
            >
              <p
                onClick={() => openSavedNote(note)}
                style={{
                  margin: "0 0 6px",
                  color: "#E2E8F0",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {note.type}
              </p>

              <p
                style={{
                  margin: "0 0 8px",
                  color: "#64748B",
                  fontSize: 11,
                }}
              >
                {note.date}
              </p>

              <button onClick={() => deleteSavedNote(note.id)} style={deleteBtn}>
                Delete
              </button>
            </div>
          ))
        )}
      </aside>

      <div
        style={{
          position: "fixed",
          top: -120,
          right: -120,
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,26,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "fixed",
          bottom: -80,
          left: -80,
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 980,
          margin: "0 auto",
          marginLeft: 310,
          padding: "32px 20px 80px",
        }}
      >
        <header style={{ marginBottom: 40, textAlign: "center", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: -40,
              left: "50%",
              transform: "translateX(-50%)",
              opacity: 0.12,
            }}
          >
            <NebulaRing size={280} opacity={1} />
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,107,26,0.1)",
              border: "1px solid rgba(255,107,26,0.3)",
              borderRadius: 999,
              padding: "5px 14px",
              fontSize: 12,
              color: "#FF8C42",
              letterSpacing: "0.1em",
              marginBottom: 20,
            }}
          >
            <GlowDot color="#FF6B1A" size={5} />
            GALACTIC AI ENGINE v3.0
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 800,
              margin: "0 0 10px",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "#FF6B1A" }}>AI</span>{" "}
            <span style={{ color: "#FFFFFF" }}>Study</span>{" "}
            <span style={{ color: "#FF6B1A" }}>Assistant</span>
          </h1>

          <p
            style={{
              color: "#94A3B8",
              fontSize: 15,
              margin: 0,
              maxWidth: 650,
              marginInline: "auto",
              lineHeight: 1.6,
            }}
          >
            Upload one or more notes — generate summaries, important notes, exam questions,
            advanced questions, MCQs, and chat with your study material.
          </p>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              justifyContent: "center",
              gap: 12,
              alignItems: "center",
            }}
          >
            {user ? (
              <>
                <span style={{ color: "#CBD5E1", fontSize: 13 }}>
                  Logged in as <b style={{ color: "#FF8C42" }}>{user.username}</b>
                </span>

                <button onClick={logout} style={logoutBtn}>
                  Logout
                </button>
              </>
            ) : (
              <button onClick={() => setShowLoginModal(true)} style={loginSmallBtn}>
                Login / Sign Up
              </button>
            )}
          </div>
        </header>

        <section
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,107,26,0.2)",
            borderRadius: 20,
            padding: "28px 28px 24px",
            marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <GlowDot color="#FF6B1A" />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "#FF8C42",
                textTransform: "uppercase",
              }}
            >
              Neural Input
            </span>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${
                files.length > 0 ? "rgba(255,107,26,0.6)" : "rgba(255,255,255,0.12)"
              }`,
              borderRadius: 14,
              padding: "24px 20px",
              textAlign: "center",
              cursor: "pointer",
              marginBottom: 22,
              background: files.length > 0 ? "rgba(255,107,26,0.05)" : "transparent",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            <div style={{ fontSize: 28, marginBottom: 8 }}>📡</div>

            {files.length > 0 ? (
              <div>
                <p
                  style={{
                    color: "#FF8C42",
                    fontWeight: 600,
                    margin: "0 0 8px",
                    fontSize: 14,
                  }}
                >
                  ✓ {files.length} file{files.length > 1 ? "s" : ""} selected
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  {files.map((file) => (
                    <div
                      key={file.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        padding: "7px 10px",
                        width: "min(100%, 520px)",
                      }}
                    >
                      <span
                        style={{
                          color: "#CBD5E1",
                          fontSize: 13,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {file.name}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.name);
                        }}
                        style={deleteBtn}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: "#64748B", margin: "0 0 4px", fontSize: 14 }}>
                  Click to upload your documents
                </p>
                <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>
                  PDF, DOCX, TXT, PNG, JPG, JPEG, WEBP supported
                </p>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 16,
              padding: 12,
              borderRadius: 12,
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ color: "#94A3B8", fontSize: 13 }}>Fast Notes Pages:</span>

            <input
              type="number"
              min="1"
              value={startPage}
              onChange={(e) => setStartPage(Number(e.target.value))}
              style={pageInput}
            />

            <span style={{ color: "#64748B" }}>to</span>

            <input
              type="number"
              min="1"
              value={endPage}
              onChange={(e) => setEndPage(Number(e.target.value))}
              style={pageInput}
            />

            <button
              onClick={handleFastNotes}
              disabled={loadingState.fastNotes}
              style={{
                background: "rgba(16,185,129,0.16)",
                border: "1px solid rgba(16,185,129,0.45)",
                color: "#6EE7B7",
                borderRadius: 10,
                padding: "10px 14px",
                cursor: loadingState.fastNotes ? "not-allowed" : "pointer",
                fontSize: 13,
                fontWeight: 800,
                opacity: loadingState.fastNotes ? 0.5 : 1,
              }}
            >
              {loadingState.fastNotes ? "Generating..." : "⚡ Fast Notes"}
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <ActionBtn onClick={handleSummary} color="#3B82F6" icon="⚡" label="Summary" loading={loadingState.summary} />
            <ActionBtn onClick={handleNotes} color="#10B981" icon="🛸" label="Full Notes" loading={loadingState.notes} />
            <ActionBtn onClick={handleQuestions} color="#8B5CF6" icon="🌌" label="Exam Questions" loading={loadingState.qbank} />
            <ActionBtn
              onClick={handleAdvancedQuestions}
              color="#EF4444"
              icon="🚀"
              label="Advanced Questions"
              loading={loadingState.advancedQuestions}
            />
            <ActionBtn onClick={handleMCQ} color="#FF6B1A" icon="🪐" label="MCQ Cosmos" loading={loadingState.mcq} />
          </div>
        </section>

        {(summary || notes || questionBank || advancedQuestions || mcqs || anyLoading) && (
          <section style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <GlowDot color="#3B82F6" />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    color: "#60A5FA",
                    textTransform: "uppercase",
                  }}
                >
                  Transmission Results
                </span>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={resetPanelLayout} style={resetBtn}>
                  Reset Layout
                </button>

                <button onClick={clearAllResults} style={deleteBtn}>
                  Clear All
                </button>
              </div>
            </div>

            <div
              style={{
                marginBottom: 18,
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              {renderMinimizedPanels()}
            </div>

            <div
              style={{
                position: "relative",
                width: "100%",
                minHeight: 820,
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.015)",
                overflow: "hidden",
              }}
            >
              {renderActivePanels()}
            </div>
          </section>
        )}

        <section
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(139,92,246,0.25)",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(139,92,246,0.05)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(255,107,26,0.15)",
                border: "1px solid rgba(255,107,26,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              ✦
            </div>

            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
                Orion AI — Chat Interface
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <GlowDot color="#10B981" size={5} />
                <span style={{ fontSize: 12, color: "#A5B4FC", fontWeight: 500 }}>
                  Neural core online · Uses uploaded notes + internet when needed
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              minHeight: 220,
              maxHeight: 380,
              overflowY: "auto",
              padding: "20px 20px 8px",
            }}
          >
            {chatHistory.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#374151" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🌠</div>
                <p style={{ fontSize: 14, margin: 0 }}>
                  Upload documents or ask directly using Orion AI
                </p>
              </div>
            )}

            {chatHistory.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} text={msg.text} />
            ))}

            {loadingState.chat && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#94A3B8", fontSize: 13 }}>
                <OrbitLoader color="#FF6B1A" />
                <span>
                  Orion is thinking
                  <Cursor />
                </span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <div
            style={{
              padding: "14px 16px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              gap: 10,
            }}
          >
            <input
              type="text"
              placeholder="Ask Orion anything — from your notes or the internet..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleChat();
                }
              }}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "11px 16px",
                color: "#E2E8F0",
                fontSize: 14,
                outline: "none",
                caretColor: "#FF6B1A",
              }}
            />

            <button
              onClick={handleChat}
              disabled={loadingState.chat}
              style={{
                background: loadingState.chat ? "rgba(255,107,26,0.2)" : "rgba(255,107,26,0.85)",
                border: "none",
                borderRadius: 10,
                padding: "0 20px",
                cursor: loadingState.chat ? "not-allowed" : "pointer",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "0.04em",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {loadingState.chat ? (
                <OrbitLoader color="#fff" />
              ) : (
                <>
                  Launch <span style={{ fontSize: 16 }}>↗</span>
                </>
              )}
            </button>
          </div>
        </section>

        <footer style={{ textAlign: "center", marginTop: 40, color: "#374151", fontSize: 12 }}>
          <span style={{ color: "#FF6B1A" }}>✦</span> Orion Assistant —
          Galactic Edition &nbsp;·&nbsp; Powered by Neural Core
        </footer>
      </div>
    </div>
  );

  function panelProps(id, label, icon, accent, content, loadingKey) {
    return {
      id,
      label,
      icon,
      accent,
      content,
      isLoading: loadingState[loadingKey],
      onMinimize: minimizePanel,
      onRestore: restorePanel,
      onClear: clearPanel,
      onCopy: copyPanelContent,
      onDownload: downloadPanelContent,
      layout: panelLayouts[id],
      onLayoutChange: updatePanelLayout,
      zIndex: panelZIndexes[id],
      onBringToFront: bringPanelToFront,
    };
  }

  function renderMinimizedPanels() {
    return (
      <>
        {minimizedPanels.includes("summary") && (
          <ResultPanel {...panelProps("summary", "Summary", "⚡", "#3B82F6", summary, "summary")} isMinimized />
        )}

        {minimizedPanels.includes("notes") && (
          <ResultPanel {...panelProps("notes", "Important Notes", "🛸", "#10B981", notes, "notes")} isMinimized />
        )}

        {minimizedPanels.includes("questionBank") && (
          <ResultPanel {...panelProps("questionBank", "Exam Questions", "🌌", "#8B5CF6", questionBank, "qbank")} isMinimized />
        )}

        {minimizedPanels.includes("advancedQuestions") && (
          <ResultPanel
            {...panelProps("advancedQuestions", "Advanced Questions", "🚀", "#EF4444", advancedQuestions, "advancedQuestions")}
            isMinimized
          />
        )}

        {minimizedPanels.includes("mcqs") && (
          <ResultPanel {...panelProps("mcqs", "MCQ Cosmos", "🪐", "#FF6B1A", mcqs, "mcq")} isMinimized />
        )}
      </>
    );
  }

  function renderActivePanels() {
    return (
      <>
        {activePanels.includes("summary") && (
          <ResultPanel
            {...panelProps("summary", "Summary", "⚡", "#3B82F6", summary, "summary")}
            isMinimized={false}
            bounds="parent"
          />
        )}

        {activePanels.includes("notes") && (
          <ResultPanel
            {...panelProps("notes", "Important Notes", "🛸", "#10B981", notes, loadingState.fastNotes ? "fastNotes" : "notes")}
            isMinimized={false}
            bounds="parent"
          />
        )}

        {activePanels.includes("questionBank") && (
          <ResultPanel
            {...panelProps("questionBank", "Exam Questions", "🌌", "#8B5CF6", questionBank, "qbank")}
            isMinimized={false}
            bounds="parent"
          />
        )}

        {activePanels.includes("advancedQuestions") && (
          <ResultPanel
            {...panelProps("advancedQuestions", "Advanced Questions", "🚀", "#EF4444", advancedQuestions, "advancedQuestions")}
            isMinimized={false}
            bounds="parent"
          />
        )}

        {activePanels.includes("mcqs") && (
          <ResultPanel
            {...panelProps("mcqs", "MCQ Cosmos", "🪐", "#FF6B1A", mcqs, "mcq")}
            isMinimized={false}
            bounds="parent"
          />
        )}
      </>
    );
  }
}

const miniBtn = (accent) => ({
  background: `${accent}18`,
  border: `1px solid ${accent}45`,
  color: accent,
  borderRadius: 8,
  padding: "5px 10px",
  cursor: "pointer",
  fontSize: 12,
});

const darkBtn = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#CBD5E1",
  borderRadius: 8,
  padding: "5px 10px",
  cursor: "pointer",
  fontSize: 12,
};

const deleteBtn = {
  background: "rgba(239,68,68,0.12)",
  border: "1px solid rgba(239,68,68,0.35)",
  color: "#F87171",
  borderRadius: 8,
  padding: "5px 10px",
  cursor: "pointer",
  fontSize: 12,
};

const saveBtn = {
  width: "100%",
  background: "rgba(16,185,129,0.12)",
  border: "1px solid rgba(16,185,129,0.35)",
  color: "#6EE7B7",
  borderRadius: 10,
  padding: "9px 10px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 10,
};

const saveBtnBlue = {
  width: "100%",
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(59,130,246,0.35)",
  color: "#93C5FD",
  borderRadius: 10,
  padding: "9px 10px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 10,
};

const saveBtnOrange = {
  width: "100%",
  background: "rgba(255,107,26,0.12)",
  border: "1px solid rgba(255,107,26,0.35)",
  color: "#FF8C42",
  borderRadius: 10,
  padding: "9px 10px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 18,
};

const resetBtn = {
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(59,130,246,0.35)",
  color: "#93C5FD",
  borderRadius: 10,
  padding: "7px 12px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.04em",
};

const logoutBtn = {
  background: "rgba(239,68,68,0.12)",
  border: "1px solid rgba(239,68,68,0.35)",
  color: "#FCA5A5",
  borderRadius: 10,
  padding: "8px 12px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
};

const loginSmallBtn = {
  background: "rgba(255,107,26,0.14)",
  border: "1px solid rgba(255,107,26,0.45)",
  color: "#FF8C42",
  borderRadius: 10,
  padding: "8px 12px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
};

const pageInput = {
  width: 90,
  padding: "9px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  color: "#E2E8F0",
  outline: "none",
};
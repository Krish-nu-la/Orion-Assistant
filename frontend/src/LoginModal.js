import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function LoginModal({ onClose, onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/login" : "/register";

      const payload =
        mode === "login"
          ? { email, password }
          : { username, email, password };

      const res = await axios.post(`${API_BASE_URL}${endpoint}`, payload);

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      onLogin(res.data.user);
      onClose();
    } catch (err) {
  console.log("AUTH ERROR:", err);
  console.log("BACKEND RESPONSE:", err.response?.data);

  let message = "Authentication failed. Please try again.";

  if (err.response?.data?.detail) {
    if (Array.isArray(err.response.data.detail)) {
      message = err.response.data.detail
        .map((item) => item.msg || JSON.stringify(item))
        .join(", ");
    } else {
      message = err.response.data.detail;
    }
  } else if (err.message) {
    message = err.message;
  }

  setError(message);
} finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeBtn}>
          ×
        </button>

        <h2 style={styles.logo}>Orion AI</h2>

        <h3 style={styles.title}>
          {mode === "login" ? "Login to continue" : "Create your account"}
        </h3>

        <p style={styles.subtitle}>
          Login or sign up to generate and save study material.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleAuth}>
          {mode === "register" && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button type="submit" disabled={loading} style={styles.primaryBtn}>
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Sign Up"}
          </button>
        </form>

        <p style={styles.switchText}>
          {mode === "login" ? "No account?" : "Already registered?"}{" "}
          <button
            onClick={() => {
              setError("");
              setMode(mode === "login" ? "register" : "login");
            }}
            style={styles.switchBtn}
          >
            {mode === "login" ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.72)",
    backdropFilter: "blur(8px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 420,
    background: "#0F172A",
    border: "1px solid rgba(255,107,26,0.35)",
    borderRadius: 22,
    padding: 28,
    color: "#E2E8F0",
    boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 16,
    background: "transparent",
    border: "none",
    color: "#94A3B8",
    fontSize: 28,
    cursor: "pointer",
  },
  logo: {
    margin: "0 0 8px",
    color: "#FF6B1A",
    textAlign: "center",
  },
  title: {
    textAlign: "center",
    margin: "0 0 8px",
  },
  subtitle: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 14,
    marginBottom: 22,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.05)",
    color: "#E2E8F0",
    outline: "none",
    marginBottom: 12,
  },
  primaryBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: "#FF6B1A",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
    marginTop: 8,
  },
  switchText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 13,
  },
  switchBtn: {
    background: "transparent",
    border: "none",
    color: "#FF6B1A",
    fontWeight: 800,
    cursor: "pointer",
  },
  error: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.35)",
    color: "#FCA5A5",
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    fontSize: 13,
  },
};
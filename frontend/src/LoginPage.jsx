import React, { useState } from "react";
import { loginUser, registerUser } from "./api";

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;

      if (mode === "login") {
        data = await loginUser(email, password);
      } else {
        data = await registerUser(username, email, password);
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin(data.user);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>Orion AI</h1>

        <h2 style={styles.title}>
          {mode === "login" ? "Login to your account" : "Create your account"}
        </h2>

        <p style={styles.subtitle}>
          Upload notes, generate summaries, MCQs, and exam questions.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === "register" && (
            <input
              style={styles.input}
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}

          <input
            style={styles.input}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Register"}
          </button>
        </form>

        <p style={styles.switchText}>
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            style={styles.switchButton}
            onClick={() => {
              setError("");
              setMode(mode === "login" ? "register" : "login");
            }}
          >
            {mode === "login" ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #312e81 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "Inter, Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(255, 255, 255, 0.96)",
    borderRadius: "24px",
    padding: "34px",
    boxShadow: "0 25px 70px rgba(0, 0, 0, 0.35)",
  },
  logo: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "800",
    color: "#312e81",
    textAlign: "center",
  },
  title: {
    marginTop: "20px",
    marginBottom: "8px",
    fontSize: "24px",
    textAlign: "center",
    color: "#111827",
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  input: {
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    outline: "none",
  },
  button: {
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "#4f46e5",
    color: "white",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
  },
  switchText: {
    marginTop: "20px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
  },
  switchButton: {
    border: "none",
    background: "transparent",
    color: "#4f46e5",
    fontWeight: "700",
    cursor: "pointer",
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "16px",
    fontSize: "14px",
  },
};
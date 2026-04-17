import React, { useState } from "react";
import axios from "axios";

function Login({ onLoginSuccess, onRegisterClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("https://academic-hub-backend-2.onrender.com/api/auth/login", {
        email,
        password,
      });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        onLoginSuccess(res.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Login failed! Check your credentials.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎓 Academic Analytics Hub</h1>
        <h3 style={styles.subtitle}>Login</h3>

        {error && <div style={styles.error}>{error}</div>}

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          style={styles.button}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={styles.link}>
          Don't have an account?{" "}
          <span style={styles.linkText} onClick={onRegisterClick}>
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh", display: "flex",
    justifyContent: "center", alignItems: "center",
    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
  },
  card: {
    background: "#fff", borderRadius: 16, padding: 40,
    width: 380, boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    display: "flex", flexDirection: "column", gap: 16,
  },
  title: { textAlign: "center", color: "#1a1a2e", margin: 0, fontSize: 22 },
  subtitle: { textAlign: "center", color: "#666", margin: 0 },
  input: {
    padding: "12px 16px", borderRadius: 8, fontSize: 15,
    border: "1px solid #ddd", outline: "none",
  },
  button: {
    padding: "13px", borderRadius: 8, background: "#4f46e5",
    color: "#fff", fontSize: 16, fontWeight: "bold",
    border: "none", cursor: "pointer",
  },
  error: {
    background: "#fee2e2", color: "#dc2626",
    padding: "10px", borderRadius: 8, fontSize: 14,
  },
  link: { textAlign: "center", color: "#666", fontSize: 14 },
  linkText: { color: "#4f46e5", cursor: "pointer", fontWeight: "bold" },
};

export default Login;
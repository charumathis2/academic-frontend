import React, { useState } from "react";

function AdminLogin({ onAdminLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    // Simple admin password
    if (password === "admin123") {
      onAdminLogin();
    } else {
      setError("Wrong admin password!");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎓 Academic Analytics Hub</h1>
        <h3 style={styles.subtitle}>Admin Login</h3>
        {error && <div style={styles.error}>{error}</div>}
        <input
          style={styles.input}
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleLogin()}
        />
        <button style={styles.button} onClick={handleLogin}>
          Login as Admin
        </button>
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
    padding: "13px", borderRadius: 8, background: "#dc2626",
    color: "#fff", fontSize: 16, fontWeight: "bold",
    border: "none", cursor: "pointer",
  },
  error: {
    background: "#fee2e2", color: "#dc2626",
    padding: "10px", borderRadius: 8, fontSize: 14,
  },
};

export default AdminLogin;
import React, { useState } from "react";
import axios from "axios";

function Register({ onRegisterSuccess, onLoginClick }) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", department: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        "https://academic-hub-backend-2.onrender.com/api/auth/register", form
      );
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        onRegisterSuccess(res.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Registration failed!");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎓 Academic Analytics Hub</h1>
        <h3 style={styles.subtitle}>Register</h3>

        {error && <div style={styles.error}>{error}</div>}

        <input style={styles.input} name="name"
          placeholder="Full Name" onChange={handleChange} />
        <input style={styles.input} name="email" type="email"
          placeholder="Email" onChange={handleChange} />
        <input style={styles.input} name="password" type="password"
          placeholder="Password" onChange={handleChange} />
        <input style={styles.input} name="department"
          placeholder="Department (e.g. CSE)" onChange={handleChange} />

        <button style={styles.button} onClick={handleRegister} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p style={styles.link}>
          Already have an account?{" "}
          <span style={styles.linkText} onClick={onLoginClick}>
            Login here
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

export default Register;
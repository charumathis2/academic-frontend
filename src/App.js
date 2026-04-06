import React, { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [page, setPage] = useState("home");
  const [studentData, setStudentData] = useState(null);

  const handleLoginSuccess = (data) => {
    setStudentData(data);
    setPage("dashboard");
  };

  if (page === "home") return (
    <div style={styles.home}>
      <div style={styles.homeCard}>
        <h1 style={styles.homeTitle}>🎓 Academic Analytics Hub</h1>
        <p style={styles.homeSubtitle}>
          Intelligent Student Performance Tracking System
        </p>
        <button style={styles.studentBtn}
          onClick={() => setPage("login")}>
          👨‍🎓 Student Login
        </button>
        <button style={styles.adminBtn}
          onClick={() => setPage("adminlogin")}>
          👨‍💼 Admin Login
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {page === "login" && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onRegisterClick={() => setPage("register")}
        />
      )}
      {page === "register" && (
        <Register
          onRegisterSuccess={handleLoginSuccess}
          onLoginClick={() => setPage("login")}
        />
      )}
      {page === "dashboard" && (
        <Dashboard
          studentData={studentData}
          onLogout={() => setPage("home")}
        />
      )}
      {page === "adminlogin" && (
        <AdminLogin
          onAdminLogin={() => setPage("admindashboard")}
        />
      )}
      {page === "admindashboard" && (
        <AdminDashboard
          onLogout={() => setPage("home")}
        />
      )}
    </div>
  );
}

const styles = {
  home: {
    minHeight: "100vh", display: "flex",
    justifyContent: "center", alignItems: "center",
    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
  },
  homeCard: {
    background: "#fff", borderRadius: 16, padding: 48,
    width: 420, boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    display: "flex", flexDirection: "column",
    gap: 16, textAlign: "center",
  },
  homeTitle: { color: "#1a1a2e", margin: 0, fontSize: 26 },
  homeSubtitle: { color: "#666", margin: 0, fontSize: 14 },
  studentBtn: {
    padding: "14px", borderRadius: 8, background: "#4f46e5",
    color: "#fff", fontSize: 16, fontWeight: "bold",
    border: "none", cursor: "pointer",
  },
  adminBtn: {
    padding: "14px", borderRadius: 8, background: "#dc2626",
    color: "#fff", fontSize: 16, fontWeight: "bold",
    border: "none", cursor: "pointer",
  },
};

export default App;
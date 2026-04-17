import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar
} from "recharts";

function Dashboard({ studentData, onLogout }) {
  const [analytics, setAnalytics] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // ✅ FIXED useEffect (no dependency error)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, deadlineRes] = await Promise.all([
          axios.get(
            `https://academic-hub-backend-2.onrender.com/api/analytics/student/${studentData.studentId}`,
            { headers }
          ),
          axios.get(
            `https://academic-hub-backend-2.onrender.com/api/deadlines/student/${studentData.studentId}`,
            { headers }
          ),
        ]);

        setAnalytics(analyticsRes.data);
        setDeadlines(deadlineRes.data);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);

  }, [studentData]); // ✅ dependency fixed

  const getTimeLeft = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    const hours = Math.floor(diff / 3600000);
    if (hours < 0) return { text: "⛔ Overdue", color: "#7f1d1d" };
    if (hours < 24) return { text: `🔴 ${hours}h left`, color: "#dc2626" };
    const days = Math.floor(hours / 24);
    if (days <= 3) return { text: `🟠 ${days} days left`, color: "#ea580c" };
    return { text: `🟢 ${days} days left`, color: "#16a34a" };
  };

  const getPriorityColor = (priority) => {
    const colors = {
      CRITICAL: "#dc2626", HIGH: "#ea580c",
      MEDIUM: "#ca8a04", LOW: "#16a34a"
    };
    return colors[priority] || "#666";
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(
        `https://academic-hub-backend-2.onrender.com/api/deadlines/${id}/complete`,
        {}, { headers }
      );
      window.location.reload(); // simpler refresh
    } catch (err) {
      console.error("Error completing deadline", err);
    }
  };

  if (!analytics) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingText}>Loading Analytics... ⏳</div>
      </div>
    );
  }

  const barData = [
    { name: "Average", value: analytics.averageScore, fill: "#4f46e5" },
    { name: "Highest", value: analytics.highestScore, fill: "#16a34a" },
    { name: "Lowest", value: analytics.lowestScore, fill: "#dc2626" },
  ];

  const radialData = [
    { name: "Score", value: analytics.averageScore, fill: "#4f46e5" }
  ];

  const getPerformanceColor = (level) => {
    if (level === "GOOD") return "#16a34a";
    if (level === "AVERAGE") return "#ca8a04";
    return "#dc2626";
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🎓 Academic Analytics Hub</h1>
          <p style={styles.welcome}>Welcome, {studentData.name}! 👋</p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.liveBadge}>
            🟢 LIVE · Updated {lastUpdated}
          </div>
          <button style={styles.logoutBtn} onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.cardRow}>
        <div style={{ ...styles.card, borderTop: "4px solid #4f46e5" }}>
          <div style={{ ...styles.cardValue, color: "#4f46e5" }}>
            {analytics.averageScore}%
          </div>
          <div style={styles.cardLabel}>Average Score</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1000, margin: "0 auto", padding: 24,
    fontFamily: "'Segoe UI', sans-serif",
    background: "#f8fafc", minHeight: "100vh"
  },
  loading: {
    minHeight: "100vh", display: "flex",
    justifyContent: "center", alignItems: "center"
  },
  loadingText: { fontSize: 22, color: "#4f46e5" },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 24,
    background: "#fff", padding: "16px 24px",
    borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  title: { margin: 0, color: "#1a1a2e", fontSize: 22 },
  welcome: { margin: 0, color: "#666", fontSize: 14 },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  liveBadge: {
    background: "#dcfce7", color: "#16a34a",
    padding: "6px 14px", borderRadius: 20,
    fontSize: 13, fontWeight: "bold"
  },
  logoutBtn: {
    background: "#fee2e2", color: "#dc2626", border: "none",
    padding: "8px 16px", borderRadius: 8,
    cursor: "pointer", fontWeight: "bold"
  }
};

export default Dashboard;
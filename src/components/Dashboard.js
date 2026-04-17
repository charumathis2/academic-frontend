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

  // ⭐ UNIQUE FEATURE: Auto refresh every 30 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // ⭐ UNIQUE FEATURE: Smart time constraint logic
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
      fetchData();
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

      {/* Header */}
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

      {/* Stats Cards */}
      <div style={styles.cardRow}>
        <div style={{ ...styles.card, borderTop: "4px solid #4f46e5" }}>
          <div style={{ ...styles.cardValue, color: "#4f46e5" }}>
            {analytics.averageScore}%
          </div>
          <div style={styles.cardLabel}>Average Score</div>
        </div>
        <div style={{ ...styles.card, borderTop: "4px solid #16a34a" }}>
          <div style={{ ...styles.cardValue, color: "#16a34a" }}>
            {analytics.highestScore}%
          </div>
          <div style={styles.cardLabel}>Highest Score</div>
        </div>
        <div style={{ ...styles.card, borderTop: "4px solid #dc2626" }}>
          <div style={{ ...styles.cardValue, color: "#dc2626" }}>
            {analytics.lowestScore}%
          </div>
          <div style={styles.cardLabel}>Lowest Score</div>
        </div>
        <div style={{
          ...styles.card,
          borderTop: `4px solid ${getPerformanceColor(analytics.performanceLevel)}`
        }}>
          <div style={{
            ...styles.cardValue,
            color: getPerformanceColor(analytics.performanceLevel),
            fontSize: 18
          }}>
            {analytics.performanceLevel}
          </div>
          <div style={styles.cardLabel}>Performance</div>
        </div>
        <div style={{ ...styles.card, borderTop: "4px solid #f59e0b" }}>
          <div style={{ ...styles.cardValue, color: "#f59e0b" }}>
            {analytics.urgentDeadlines}
          </div>
          <div style={styles.cardLabel}>Urgent Deadlines</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={styles.chartsRow}>
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>📊 Score Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>🎯 Overall Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart
              innerRadius="60%" outerRadius="100%"
              data={radialData} startAngle={180} endAngle={0}
            >
              <RadialBar dataKey="value" fill="#4f46e5" />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={styles.radialCenter}>
            {analytics.averageScore}%
          </div>
        </div>
      </div>

      {/* ⭐ Deadlines — View Only (assigned by Admin/Teacher) */}
      <div style={styles.deadlineSection}>
        <div style={styles.deadlineHeader}>
          <h3 style={styles.chartTitle}>⏰ Deadlines Assigned by Teacher</h3>
        </div>

        {deadlines.length === 0 ? (
          <div style={styles.noDeadlines}>
            🎉 No pending deadlines!
          </div>
        ) : (
          deadlines.map((d) => {
            const timeLeft = getTimeLeft(d.dueDate);
            return (
              <div key={d.id} style={{
                ...styles.deadlineCard,
                borderLeft: `4px solid ${getPriorityColor(d.priority)}`
              }}>
                <div style={styles.deadlineTop}>
                  <strong style={styles.deadlineTitle}>{d.title}</strong>
                  <span style={{
                    ...styles.priorityBadge,
                    background: getPriorityColor(d.priority)
                  }}>
                    {d.priority}
                  </span>
                </div>
                <div style={{
                  color: timeLeft.color,
                  fontWeight: "bold", fontSize: 14
                }}>
                  {timeLeft.text}
                </div>
                <div style={styles.deadlineDesc}>{d.description}</div>
                <button
                  style={styles.completeBtn}
                  onClick={() => handleComplete(d.id)}
                >
                  ✅ Mark Complete
                </button>
              </div>
            );
          })
        )}
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
  },
  cardRow: {
    display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap"
  },
  card: {
    flex: 1, minWidth: 140, background: "#fff", borderRadius: 12,
    padding: "20px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    textAlign: "center"
  },
  cardValue: { fontSize: 28, fontWeight: "bold" },
  cardLabel: { color: "#666", marginTop: 6, fontSize: 13 },
  chartsRow: { display: "flex", gap: 16, marginBottom: 24 },
  chartBox: {
    flex: 1, background: "#fff", borderRadius: 12,
    padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    position: "relative"
  },
  chartTitle: { margin: "0 0 16px 0", color: "#1a1a2e", fontSize: 16 },
  radialCenter: {
    position: "absolute", top: "60%", left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: 28, fontWeight: "bold", color: "#4f46e5"
  },
  deadlineSection: {
    background: "#fff", borderRadius: 12,
    padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  deadlineHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16
  },
  noDeadlines: {
    textAlign: "center", padding: 30,
    color: "#666", fontSize: 16
  },
  deadlineCard: {
    background: "#f9f9f9", borderRadius: 8, padding: 16,
    marginBottom: 12, display: "flex",
    flexDirection: "column", gap: 6
  },
  deadlineTop: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center"
  },
  deadlineTitle: { fontSize: 15, color: "#1a1a2e" },
  priorityBadge: {
    color: "#fff", fontSize: 11, padding: "3px 10px",
    borderRadius: 20, fontWeight: "bold"
  },
  deadlineDesc: { color: "#666", fontSize: 13 },
  completeBtn: {
    background: "#dcfce7", color: "#16a34a", border: "none",
    padding: "6px 14px", borderRadius: 6,
    cursor: "pointer", fontWeight: "bold",
    fontSize: 13, width: "fit-content"
  },
};

export default Dashboard;
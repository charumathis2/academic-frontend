import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

function AdminDashboard({ onLogout }) {
  const [analytics, setAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [students, setStudents] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdated, setLastUpdated] = useState("");
  const [assignForm, setAssignForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM",
    studentId: "all"
  });
  const [assignMsg, setAssignMsg] = useState("");

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    try {
      const [analyticsRes, leaderboardRes, studentsRes, deadlinesRes] =
        await Promise.all([
          axios.get("http://localhost:8080/api/admin/analytics"),
          axios.get("http://localhost:8080/api/admin/leaderboard"),
          axios.get("http://localhost:8080/api/admin/students"),
          axios.get("http://localhost:8080/api/admin/deadlines"),
        ]);
      setAnalytics(analyticsRes.data);
      setLeaderboard(leaderboardRes.data);
      setStudents(studentsRes.data);
      setDeadlines(deadlinesRes.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Error fetching admin data", err);
    }
  };

  const handleAssignDeadline = async () => {
    try {
      if (!assignForm.title || !assignForm.dueDate) {
        setAssignMsg("❌ Please fill title and due date!");
        return;
      }

      const token = localStorage.getItem("token");
      const headers = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      if (assignForm.studentId === "all") {
        for (const student of students) {
          await axios.post(
            "http://localhost:8080/api/deadlines",
            {
              title: assignForm.title,
              description: assignForm.description,
              dueDate: assignForm.dueDate + ":00",
              priority: assignForm.priority,
              student: { id: student.id },
              isCompleted: false
            },
            { headers }
          );
        }
        setAssignMsg(
          `✅ Deadline assigned to ALL ${students.length} students!`
        );
      } else {
        await axios.post(
          "http://localhost:8080/api/deadlines",
          {
            title: assignForm.title,
            description: assignForm.description,
            dueDate: assignForm.dueDate + ":00",
            priority: assignForm.priority,
            student: { id: parseInt(assignForm.studentId) },
            isCompleted: false
          },
          { headers }
        );
        setAssignMsg("✅ Deadline assigned to student!");
      }

      setAssignForm({
        title: "", description: "",
        dueDate: "", priority: "MEDIUM", studentId: "all"
      });
      fetchAll();
      setTimeout(() => setAssignMsg(""), 3000);
    } catch (err) {
      console.error("Error:", err);
      setAssignMsg("❌ Error: " + (err.response?.data?.message || err.message));
    }
  };

  if (!analytics) return (
    <div style={styles.loading}>Loading Admin Dashboard... ⏳</div>
  );

  const pieData = [
    { name: "Pass", value: analytics.passCount },
    { name: "Fail", value: analytics.failCount },
  ];
  const PIE_COLORS = ["#16a34a", "#dc2626"];
  const top10 = leaderboard.slice(0, 10);

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🎓 Academic Analytics Hub</h1>
          <p style={styles.subtitle}>Admin Dashboard</p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.liveBadge}>🟢 LIVE · {lastUpdated}</div>
          <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {["overview","leaderboard","students","deadlines","assign"].map((tab) => (
          <button key={tab} style={{
            ...styles.tab,
            background: activeTab === tab ? "#4f46e5" : "#fff",
            color: activeTab === tab ? "#fff" : "#666",
          }} onClick={() => setActiveTab(tab)}>
            {tab === "overview"    && "📊 Overview"}
            {tab === "leaderboard" && "🏆 Leaderboard"}
            {tab === "students"    && "👥 Students"}
            {tab === "deadlines"   && "⏰ Deadlines"}
            {tab === "assign"      && "📝 Assign Deadline"}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div>
          <div style={styles.cardRow}>
            <StatCard label="Total Students" value={analytics.totalStudents} color="#4f46e5" />
            <StatCard label="Class Average" value={`${analytics.classAverage}%`} color="#16a34a" />
            <StatCard label="Highest Score" value={`${analytics.highestScore}%`} color="#f59e0b" />
            <StatCard label="Lowest Score" value={`${analytics.lowestScore}%`} color="#dc2626" />
            <StatCard label="Pass Count" value={analytics.passCount} color="#16a34a" />
            <StatCard label="Fail Count" value={analytics.failCount} color="#dc2626" />
          </div>
          <div style={styles.chartsRow}>
            <div style={styles.chartBox}>
              <h3 style={styles.chartTitle}>📊 Top 10 Students</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={top10}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }}
                    angle={-45} textAnchor="end" height={60} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="averageScore" fill="#4f46e5"
                    radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={styles.chartBox}>
              <h3 style={styles.chartTitle}>🎯 Pass vs Fail</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%"
                    outerRadius={80} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* LEADERBOARD TAB */}
      {activeTab === "leaderboard" && (
        <div style={styles.tableBox}>
          <h3 style={styles.chartTitle}>🏆 Student Leaderboard</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>Rank</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Average</th>
                <th style={styles.th}>Grade</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((s) => (
                <tr key={s.studentId} style={styles.tableRow}>
                  <td style={styles.td}>
                    {s.rank === 1 ? "🥇" : s.rank === 2 ? "🥈" :
                     s.rank === 3 ? "🥉" : `#${s.rank}`}
                  </td>
                  <td style={styles.td}>{s.name}</td>
                  <td style={styles.td}>{s.department}</td>
                  <td style={styles.td}>
                    <span style={{
                      color: s.averageScore >= 75 ? "#16a34a" :
                             s.averageScore >= 50 ? "#ca8a04" : "#dc2626",
                      fontWeight: "bold"
                    }}>{s.averageScore}%</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: s.grade === "A" ? "#dcfce7" :
                                  s.grade === "B" ? "#dbeafe" :
                                  s.grade === "C" ? "#fef9c3" : "#fee2e2",
                      color: s.grade === "A" ? "#16a34a" :
                             s.grade === "B" ? "#2563eb" :
                             s.grade === "C" ? "#ca8a04" : "#dc2626",
                    }}>{s.grade}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: s.averageScore >= 50 ? "#dcfce7" : "#fee2e2",
                      color: s.averageScore >= 50 ? "#16a34a" : "#dc2626",
                    }}>{s.averageScore >= 50 ? "PASS" : "FAIL"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* STUDENTS TAB */}
      {activeTab === "students" && (
        <div style={styles.tableBox}>
          <h3 style={styles.chartTitle}>
            👥 All Students ({students.length})
          </h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Department</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} style={styles.tableRow}>
                  <td style={styles.td}>{s.id}</td>
                  <td style={styles.td}>{s.name}</td>
                  <td style={styles.td}>{s.email}</td>
                  <td style={styles.td}>{s.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DEADLINES TAB */}
      {activeTab === "deadlines" && (
        <div style={styles.tableBox}>
          <h3 style={styles.chartTitle}>⏰ All Assigned Deadlines</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Assigned To</th>
                <th style={styles.th}>Due Date</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {deadlines.map((d) => (
                <tr key={d.id} style={styles.tableRow}>
                  <td style={styles.td}>{d.title}</td>
                  <td style={styles.td}>
                    {d.student ? d.student.name : "N/A"}
                  </td>
                  <td style={styles.td}>
                    {new Date(d.dueDate).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background:
                        d.priority === "CRITICAL" ? "#fee2e2" :
                        d.priority === "HIGH" ? "#ffedd5" :
                        d.priority === "MEDIUM" ? "#fef9c3" : "#dcfce7",
                      color:
                        d.priority === "CRITICAL" ? "#dc2626" :
                        d.priority === "HIGH" ? "#ea580c" :
                        d.priority === "MEDIUM" ? "#ca8a04" : "#16a34a",
                    }}>{d.priority}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: d.isCompleted ? "#dcfce7" : "#fee2e2",
                      color: d.isCompleted ? "#16a34a" : "#dc2626",
                    }}>{d.isCompleted ? "✅ DONE" : "⏳ PENDING"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ASSIGN DEADLINE TAB */}
      {activeTab === "assign" && (
        <div style={styles.tableBox}>
          <h3 style={styles.chartTitle}>📝 Assign Deadline to Students</h3>

          {assignMsg && (
            <div style={{
              padding: "12px 16px", borderRadius: 8, marginBottom: 16,
              background: assignMsg.includes("✅") ? "#dcfce7" : "#fee2e2",
              color: assignMsg.includes("✅") ? "#16a34a" : "#dc2626",
              fontWeight: "bold"
            }}>{assignMsg}</div>
          )}

          <div style={styles.assignForm}>
            <div style={styles.formGroup}>
              <label style={styles.label}>📌 Title</label>
              <input style={styles.input}
                placeholder="e.g. Math Assignment 1"
                value={assignForm.title}
                onChange={(e) => setAssignForm({
                  ...assignForm, title: e.target.value
                })}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>📄 Description</label>
              <input style={styles.input}
                placeholder="e.g. Complete exercises 1-10"
                value={assignForm.description}
                onChange={(e) => setAssignForm({
                  ...assignForm, description: e.target.value
                })}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>📅 Due Date & Time</label>
              <input style={styles.input}
                type="datetime-local"
                value={assignForm.dueDate}
                onChange={(e) => setAssignForm({
                  ...assignForm, dueDate: e.target.value
                })}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>⚡ Priority</label>
              <select style={styles.input}
                value={assignForm.priority}
                onChange={(e) => setAssignForm({
                  ...assignForm, priority: e.target.value
                })}>
                <option>LOW</option>
                <option>MEDIUM</option>
                <option>HIGH</option>
                <option>CRITICAL</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>👤 Assign To</label>
              <select style={styles.input}
                value={assignForm.studentId}
                onChange={(e) => setAssignForm({
                  ...assignForm, studentId: e.target.value
                })}>
                <option value="all">
                  🌍 All Students ({students.length})
                </option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.department}
                  </option>
                ))}
              </select>
            </div>
            <button style={styles.assignBtn}
              onClick={handleAssignDeadline}>
              📝 Assign Deadline
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 28, fontWeight: "bold", color }}>{value}</div>
      <div style={{ color: "#666", marginTop: 6, fontSize: 13 }}>{label}</div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1100, margin: "0 auto", padding: 24,
    fontFamily: "'Segoe UI', sans-serif",
    background: "#f8fafc", minHeight: "100vh"
  },
  loading: {
    textAlign: "center", padding: 60,
    fontSize: 20, color: "#4f46e5"
  },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 24,
    background: "#fff", padding: "16px 24px",
    borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  title: { margin: 0, color: "#1a1a2e", fontSize: 22 },
  subtitle: { margin: 0, color: "#666", fontSize: 13 },
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
  tabs: { display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" },
  tab: {
    padding: "10px 20px", borderRadius: 8, border: "none",
    cursor: "pointer", fontWeight: "bold", fontSize: 14,
    boxShadow: "0 2px 4px rgba(0,0,0,0.08)"
  },
  cardRow: { display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" },
  card: {
    flex: 1, minWidth: 130, background: "#fff", borderRadius: 12,
    padding: "20px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    textAlign: "center"
  },
  chartsRow: { display: "flex", gap: 16, marginBottom: 24 },
  chartBox: {
    flex: 1, background: "#fff", borderRadius: 12, padding: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  chartTitle: { margin: "0 0 16px 0", color: "#1a1a2e", fontSize: 16 },
  tableBox: {
    background: "#fff", borderRadius: 12, padding: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflowX: "auto"
  },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHead: { background: "#f1f5f9" },
  tableRow: { borderBottom: "1px solid #f1f5f9" },
  th: {
    padding: "12px 16px", textAlign: "left",
    fontSize: 13, color: "#475569", fontWeight: "bold"
  },
  td: { padding: "12px 16px", fontSize: 14, color: "#1a1a2e" },
  badge: {
    padding: "3px 10px", borderRadius: 20,
    fontSize: 12, fontWeight: "bold"
  },
  assignForm: {
    display: "flex", flexDirection: "column",
    gap: 16, maxWidth: 500
  },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontWeight: "bold", color: "#475569", fontSize: 14 },
  input: {
    padding: "10px 14px", borderRadius: 8, fontSize: 14,
    border: "1px solid #ddd", outline: "none"
  },
  assignBtn: {
    padding: "13px", borderRadius: 8, background: "#4f46e5",
    color: "#fff", fontSize: 16, fontWeight: "bold",
    border: "none", cursor: "pointer", marginTop: 8
  },
};

export default AdminDashboard;
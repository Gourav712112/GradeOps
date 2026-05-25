import React, { useState, useEffect } from 'react';

export default function App() {
  const [studentName, setStudentName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [isGrading, setIsGrading] = useState(false);
  
  // Auth Login States (Fixing the null vs empty string bug)
  // --- IS BLOCK KO APNE APP.JSX MEIN UPDATE KAREIN ---
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token");
    // Strict validation check for raw strings, null or corrupted tokens
    if (!savedToken || savedToken === "null" || savedToken === "undefined") {
      return "";
    }
    return savedToken;
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    if (token && token.trim() !== "") {
      fetchSubmissions();
    } else {
      // Force clear state if string is empty
      setToken("");
    }
  }, [token]);
  // ----------------------------------------------------

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("http://localhost:8000/submissions/", {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      } else if (res.status === 401 || res.status === 403) {
        // Force logout if token is expired or invalid
        handleDisconnectAction();
      }
    } catch (err) {
      console.error("Failed to sync database list:", err);
    }
  };

  const handleLoginAction = async (e) => {
    e.preventDefault();
    setStatusMessage({ text: 'Verifying with security node...', type: 'info' });
    
    try {
      const formData = new URLSearchParams();
      formData.append('username', usernameInput);
      formData.append('password', passwordInput);

      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        setStatusMessage({ text: 'Handshake Successful!', type: 'success' });
      } else {
        setStatusMessage({ text: 'Authentication Rejected: Check credentials.', type: 'error' });
      }
    } catch (error) {
      setStatusMessage({ text: 'Auth Server unreachable.', type: 'error' });
    }
  };

  const handleExportExcel = async () => {
    try {
      setStatusMessage({ text: "Compiling spreadsheet mapping...", type: "info" });
      const response = await fetch("http://localhost:8000/submissions/export-excel", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error();
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "GradeOps_Class_Evaluation_Report.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setStatusMessage({ text: "Excel Download complete!", type: "success" });
    } catch (error) {
      setStatusMessage({ text: "Failed to download telemetry file.", type: "error" });
    }
  };

  const handleFileUploadAction = async (e) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      setStatusMessage({ text: "Please attach at least one artifact PDF.", type: "error" });
      return;
    }
    
    setIsGrading(true);
    setStatusMessage({ text: 'Streaming files payload to evaluation matrix...', type: 'info' });

    const formData = new FormData();
    formData.append("student_name", studentName);
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("files", selectedFiles[i]);
    }

    try {
      const response = await fetch("http://localhost:8000/submissions/", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setStatusMessage({ text: "Pipeline run completed successfully!", type: "success" });
        fetchSubmissions();
        setStudentName('');
        setSelectedFiles(null);
        // Reset file input element explicitly
        e.target.reset();
      } else {
        setStatusMessage({ text: "Verification pipeline rejected payload configuration.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Network connection breakdown.", type: "error" });
    } finally {
      setIsGrading(false);
    }
  };

  const handleDisconnectAction = () => {
    localStorage.removeItem("token");
    setToken("");
    setSubmissions([]);
    setStatusMessage({ text: 'Session terminated cleanly.', type: 'info' });
  };

  const fontStyle = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  const styles = {
    container: { fontFamily: fontStyle, backgroundColor: '#f8fafc', minHeight: '100vh', padding: '24px', color: '#1e293b' },
    authCard: { maxWidth: '400px', margin: '100px auto 0 auto', backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    header: { maxWidth: '1100px', margin: '0 auto 24px auto', backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9' },
    title: { fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: 0 },
    btnExcel: { backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
    btnDisconnect: { backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
    mainLayout: { maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' },
    card: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' },
    input: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' },
    btnDeploy: { width: '100%', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' },
    alertSuccess: { backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '14px', borderRadius: '10px', marginBottom: '20px' },
    alertInfo: { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '14px', borderRadius: '10px', marginBottom: '20px' },
    alertError: { backgroundColor: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', padding: '14px', borderRadius: '10px', marginBottom: '20px' },
    monitorList: { display: 'flex', flexDirection: 'column', gap: '20px' },
    subBox: { border: '1px solid #f1f5f9', borderRadius: '16px', padding: '20px' },
    scoreBanner: { backgroundColor: '#f0fdf4', borderRadius: '10px', padding: '12px 16px', fontWeight: '700', color: '#16a34a', marginBottom: '12px' },
    feedbackBox: { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', fontSize: '14px', whiteSpace: 'pre-line' }
  };

  // -------------------------------------------------------------------------
  // IF NO TOKEN OR TOKEN BLANK -> FORCE LOGIN WINDOW DISPLAY
  // -------------------------------------------------------------------------
  if (!token || token === "null") {
    return (
      <div style={{...styles.container, backgroundColor: '#f1f5f9'}}>
        <div style={styles.authCard}>
          <div style={{textAlign: 'center', marginBottom: '24px'}}>
            <span style={{fontSize: '40px'}}>🌐</span>
            <h2 style={{...styles.title, marginTop: '12px'}}>GradeOps Security Gate</h2>
            <p style={{fontSize: '13px', color: '#64748b'}}>Establish cryptographic console handshake</p>
          </div>
          
          <form onSubmit={handleLoginAction}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Professor Username</label>
              <input 
                type="text" 
                value={usernameInput} 
                onChange={(e) => setUsernameInput(e.target.value)} 
                placeholder="prof_sharma"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Security Token Key</label>
              <input 
                type="password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)} 
                placeholder="••••••••••••"
                style={styles.input}
                required
              />
            </div>

            {statusMessage.text && (
              <div style={statusMessage.type === 'error' ? styles.alertError : styles.alertInfo}>
                {statusMessage.text}
              </div>
            )}

            <button type="submit" style={styles.btnDeploy}>
              Establish Handshake ⚡
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <span style={{fontSize:'24px'}}>🌐</span>
          <h1 style={styles.title}>GradeOps AI Core Console</h1>
        </div>
        <div style={{display:'flex', gap:'12px'}}>
          <button onClick={handleExportExcel} style={styles.btnExcel}>📊 Export Excel Report</button>
          <button onClick={handleDisconnectAction} style={styles.btnDisconnect}>Disconnect Session</button>
        </div>
      </div>

      <div style={styles.mainLayout}>
        <div style={styles.card}>
          <h2 style={{fontSize:'18px', fontWeight:'700', margin:'0 0 20px 0'}}>📂 Bulk Evaluation Center</h2>
          <form onSubmit={handleFileUploadAction}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Student Names (Comma separated)</label>
              <input 
                type="text" 
                placeholder="Leave blank to auto-parse from PDF filenames"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Student PDFs (Multiple Allowed)</label>
              <input 
                type="file" 
                multiple 
                onChange={(e) => setSelectedFiles(e.target.files)}
                style={{...styles.input, backgroundColor:'#f8fafc'}}
                required
              />
            </div>

            {statusMessage.text && (
              <div style={
                statusMessage.type === 'success' ? styles.alertSuccess :
                statusMessage.type === 'info' ? styles.alertInfo : styles.alertError
              }>
                {statusMessage.text}
              </div>
            )}

            <button type="submit" disabled={isGrading} style={styles.btnDeploy}>
              {isGrading ? "Processing Automated Evaluation Pipeline..." : "Deploy Bulk Class Script Queue"}
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <h2 style={{fontSize:'18px', fontWeight:'700', margin:'0 0 20px 0'}}>📑 Live Pipeline Evaluation Monitor</h2>
          <div style={styles.monitorList}>
            {submissions.length === 0 ? (
              <p style={{textAlign:'center', color:'#94a3b8', fontSize:'14px'}}>No entries synced in core buffer matrix.</p>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id} style={styles.subBox}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px'}}>
                    <div>
                      <h3 style={{fontSize:'16px', fontWeight:'700', margin:0}}>{sub.student_name}</h3>
                      <div style={{fontSize:'12px', color:'#94a3b8'}}>Record Matrix: #{sub.id}</div>
                    </div>
                    <span style={{backgroundColor:'#d1fae5', color:'#065f46', fontSize:'12px', fontWeight:'600', padding:'4px 10px', borderRadius:'9999px'}}>{sub.status}</span>
                  </div>
                  <div style={styles.scoreBanner}>System Validated Mark Benchmark: {sub.score}/100</div>
                  <div style={styles.feedbackBox}>{sub.ai_feedback}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
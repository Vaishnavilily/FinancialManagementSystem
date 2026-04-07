"use client";
import { useState, useEffect } from "react";
import "./page.css";
import "@/components/forms/forms.css";
import { authFetch } from "@/lib/auth-fetch";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    currency: "USD",
    timezone: "UTC"
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await authFetch("/api/settings");
        const json = await res.json();
        if (json.success && json.data) {
          setFormData(json.data);
        }
      } catch (error) {
        console.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await authFetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update settings");
      }
      
      setMessage("Settings saved successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-container"><p>Loading settings...</p></div>;
  }

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>Company Settings</h1>
        <p className="subtitle">Manage your organization&apos;s preferences and profile.</p>
      </header>

      <div className="wave-card settings-card">
        <h2 className="settings-section-title">General Preferences</h2>
        
        {message && <div className="settings-success">{message}</div>}
        {error && <div className="form-error" style={{marginBottom: '20px'}}>{error}</div>}

        <form className="settings-form" onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                className="form-control"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Base Currency</label>
              <select 
                name="currency" 
                className="form-control" 
                value={formData.currency} 
                onChange={handleChange}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Timezone</label>
              <select 
                name="timezone" 
                className="form-control" 
                value={formData.timezone} 
                onChange={handleChange}
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time (EST)</option>
                <option value="CST">Central Time (CST)</option>
                <option value="PST">Pacific Time (PST)</option>
                <option value="IST">Indian Standard Time (IST)</option>
              </select>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="wave-btn-primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

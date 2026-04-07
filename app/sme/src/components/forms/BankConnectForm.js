import { useState } from "react";
import "./forms.css";

const MOCK_BANKS = [
  "SBI Bank",
  "HDFC Bank",
  "Chase Bank",
  "Wells Fargo",
  "Bank of America",
  "Citibank",
  "Capital One"
];

export default function BankConnectForm({ onSuccess, onCancel }) {
  const [bankName, setBankName] = useState("SBI Bank");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create a simulated delay to mimic a secure connection handshake
      await new Promise(resolve => setTimeout(resolve, 1500));

      const res = await fetch("/api/bank-connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankName, accountName })
      });
      
      const json = await res.json();
      if (json.success) {
        onSuccess(json.data);
      } else {
        setError(json.error || "Failed to establish connection.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrapper">
      <p style={{marginBottom: "20px", color: "var(--color-text-secondary)", fontSize: "14px"}}>
        Select your financial institution to securely link your accounts. (Simulated integration)
      </p>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Institution</label>
          <select 
            className="form-control" 
            value={bankName} 
            onChange={(e) => setBankName(e.target.value)}
          >
            {MOCK_BANKS.map(bank => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Account Nickname</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="e.g. Business Checking"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" className="wave-btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="wave-btn-primary" disabled={loading}>
            {loading ? "Authenticating..." : "Connect Securely"}
          </button>
        </div>
      </form>
    </div>
  );
}

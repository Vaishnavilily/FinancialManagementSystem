import { useState, useEffect } from "react";
import "./forms.css";

export default function PayoutForm({ availableBalance, onSuccess, onCancel }) {
  const [amount, setAmount] = useState(availableBalance);
  const [banks, setBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingBanks, setFetchingBanks] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBanks() {
      try {
        const res = await fetch("/api/bank-connections");
        const json = await res.json();
        if (json.success) {
          setBanks(json.data);
          if (json.data.length > 0) {
            setSelectedBankId(json.data[0]._id);
          }
        }
      } catch (err) {
        console.error("Error fetching banks");
      } finally {
        setFetchingBanks(false);
      }
    }
    fetchBanks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (amount <= 0 || amount > availableBalance) {
      setError("Invalid payout amount.");
      return;
    }
    if (!selectedBankId) {
      setError("Please select a destination bank account.");
      return;
    }

    setLoading(true);
    setError("");

    const selectedBank = banks.find(b => b._id === selectedBankId);

    try {
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: parseFloat(amount),
          destinationBank: selectedBank.bankName,
          accountMask: selectedBank.accountMask
        })
      });
      
      const json = await res.json();
      if (json.success) {
        onSuccess(json.data);
      } else {
        setError(json.error || "Failed to initiate payout.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingBanks) return <div className="form-wrapper"><p>Loading bank accounts...</p></div>;

  return (
    <div className="form-wrapper">
      <p style={{marginBottom: "20px", color: "var(--color-text-secondary)", fontSize: "14px"}}>
        Transfer funds from your FinFlow holding balance directly to your connected bank account.
      </p>

      {error && <div className="form-error">{error}</div>}

      {banks.length === 0 ? (
        <div style={{ padding: "20px", backgroundColor: "#fff9c4", borderRadius: "8px", color: "#826a00" }}>
          You must connect a bank account in the <strong>Connect Accounts</strong> section before initiating a payout.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount to Transfer (Available: ${availableBalance.toFixed(2)})</label>
            <input 
              type="number" 
              className="form-control" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0.01"
              max={availableBalance}
              required
            />
          </div>

          <div className="form-group">
            <label>Destination Account</label>
            <select 
              className="form-control" 
              value={selectedBankId} 
              onChange={(e) => setSelectedBankId(e.target.value)}
              required
            >
              {banks.map(bank => (
                <option key={bank._id} value={bank._id}>
                  {bank.bankName} (....{bank.accountMask})
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="wave-btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="wave-btn-primary" disabled={loading || availableBalance <= 0}>
              {loading ? "Processing..." : `Transfer $${parseFloat(amount || 0).toFixed(2)}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

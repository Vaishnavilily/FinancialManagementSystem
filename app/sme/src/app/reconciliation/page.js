"use client";
import { useSettings } from "@/context/SettingsContext";
import { useState, useEffect } from "react";
import { Check, Search, AlertCircle, RefreshCw } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import "./page.css";

export default function Reconciliation() {
  const [bankFeed, setBankFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { currencySymbol } = useSettings();
  const fetchReconciliationData = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/reconciliation");
      const json = await res.json();
      if (json.success && json.data) {
        setBankFeed(json.data.bankFeed);
      }
    } catch (error) {
      console.error("Failed to fetch reconciliation data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliationData();
  }, []);

  const handleApproveMatch = async (bankItem) => {
    if (!bankItem.suggestedMatch) return;
    
    setProcessingId(bankItem.id);
    try {
      const res = await authFetch(`/api/transactions/${bankItem.suggestedMatch._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isReconciled: true })
      });
      const data = await res.json();
      
      if (data.success) {
        // Remove from feed
        setBankFeed(prev => prev.filter(item => item.id !== bankItem.id));
      } else {
        alert("Failed to reconcile. " + data.error);
      }
    } catch (err) {
      alert("Error reconciling transaction.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="recon-container">
      <header className="recon-header">
        <div>
          <h1>Reconciliation</h1>
          <p className="recon-subtitle">Match your bank statement lines with your FinFlow transactions.</p>
        </div>
        <button 
          className="wave-btn-secondary" 
          onClick={fetchReconciliationData}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} /> Refresh Bank Feed
        </button>
      </header>

      {loading && bankFeed.length === 0 ? (
        <div className="empty-state">
          <p>Connecting to mock bank and analyzing transactions...</p>
        </div>
      ) : bankFeed.length === 0 ? (
        <div className="wave-card empty-state">
          <Check size={48} color="var(--color-success)" style={{ marginBottom: "16px" }} />
          <h3>All Caught Up!</h3>
          <p>You have no pending bank transactions to reconcile.</p>
        </div>
      ) : (
        <div className="recon-list">
          <div className="recon-card" style={{ padding: "10px 20px", background: "transparent", border: "none", boxShadow: "none", margin: 0 }}>
            <div className="recon-side-header">Bank Statement Line</div>
            <div className="recon-side-header">FinFlow Match</div>
          </div>
          
          {bankFeed.map(item => {
            const hasMatch = !!item.suggestedMatch;
            const isProcessing = processingId === item.id;
            
            return (
              <div key={item.id} className="recon-card">
                {/* Left Side: Bank Item */}
                <div className="recon-side">
                  <div className="recon-date">{new Date(item.date).toLocaleDateString()}</div>
                  <div className="recon-desc">{item.description}</div>
                  <div className={`recon-amount ${item.type === 'Income' ? 'amount-income' : 'amount-expense'}`}>
                    {item.type === 'Income' ? '+' : ''}{item.amount < 0 ? '-' : ''}{currencySymbol}{Math.abs(item.amount).toFixed(2)}
                  </div>
                </div>

                {/* Right Side: FinFlow Match */}
                <div className={`recon-side match-side ${hasMatch ? 'perfect-match' : ''}`}>
                  {hasMatch ? (
                    <>
                      <div className="match-badge">
                        <Check size={14} /> Exact Match Found
                      </div>
                      <div className="recon-date">{new Date(item.suggestedMatch.date).toLocaleDateString()}</div>
                      <div className="recon-desc">{item.suggestedMatch.description}</div>
                      <div className="recon-amount">
                        {currencySymbol}{item.suggestedMatch.amount.toFixed(2)}
                      </div>
                      
                      <div className="match-actions">
                        <button 
                          className="wave-btn-primary btn-approve"
                          onClick={() => handleApproveMatch(item)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? "Approving..." : "Approve Match"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="no-match">
                      <AlertCircle size={24} />
                      <p>No automatic match found.</p>
                      <button className="wave-btn-secondary">
                        <Search size={14} /> Find & Match
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

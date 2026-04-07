"use client";
import { useState, useEffect } from "react";
import { Building2, Plus, RefreshCw, Landmark } from "lucide-react";
import Modal from "@/components/ui/Modal";
import BankConnectForm from "@/components/forms/BankConnectForm";
import { authFetch } from "@/lib/auth-fetch";
import "./page.css";

export default function ConnectAccounts() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/bank-connections");
      const json = await res.json();
      if (json.success) setConnections(json.data);
    } catch (error) {
      console.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleConnectSuccess = (newConnection) => {
    setConnections([newConnection, ...connections]);
    setIsModalOpen(false);
  };

  const handleDisconnect = async (id) => {
    if (!window.confirm("Are you sure you want to disconnect this bank account? This will halt any automatic transaction fetching.")) return;
    
    setIsDeleting(id);
    try {
      const res = await authFetch(`/api/bank-connections/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setConnections(connections.filter(c => c._id !== id));
      } else {
        alert("Failed to disconnect: " + json.error);
      }
    } catch (err) {
      alert("Network error while trying to disconnect.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="connect-container">
      <header className="connect-header">
        <div>
          <h1>Connected Accounts</h1>
          <p className="connect-subtitle">Manage your linked banking integrations for automated bookkeeping.</p>
        </div>
        <button 
          className="wave-btn-primary" 
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} /> Link New Account
        </button>
      </header>

      {loading ? (
        <p>Loading your secure connections...</p>
      ) : (
        <div className="connections-grid">
          {connections.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Landmark size={32} />
              </div>
              <h3>No accounts connected</h3>
              <p>Link your bank account or credit card to securely import your transactions and speed up your workflow.</p>
              <button 
                className="wave-btn-primary" 
                onClick={() => setIsModalOpen(true)}
              >
                Connect a Bank
              </button>
            </div>
          )}

          {connections.map(bank => (
            <div key={bank._id} className="wave-card bank-card">
              <div className="bank-card-header">
                <div className="bank-info">
                  <div className="bank-icon-wrapper">
                    <Building2 size={24} />
                  </div>
                  <div className="bank-details">
                    <h3>{bank.bankName}</h3>
                    <p>{bank.accountName} (....{bank.accountMask})</p>
                  </div>
                </div>
                <div className={`bank-status status-${bank.status.toLowerCase()}`}>
                  {bank.status}
                </div>
              </div>

              <div className="bank-body">
                <div className="balance-label">Current Balance</div>
                <div className="balance-amount">${bank.balance.toFixed(2)}</div>
                
                <div className="sync-info">
                  <RefreshCw size={12} />
                  Last synced: {new Date(bank.lastSync).toLocaleString()}
                </div>

                <div className="bank-actions">
                  <button 
                    className="btn-disconnect" 
                    onClick={() => handleDisconnect(bank._id)}
                    disabled={isDeleting === bank._id}
                  >
                    {isDeleting === bank._id ? "Disconnecting..." : "Disconnect"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simulated Plaid / Secure Connection Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Secure Bank Linking"
      >
        <BankConnectForm 
          onSuccess={handleConnectSuccess} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}

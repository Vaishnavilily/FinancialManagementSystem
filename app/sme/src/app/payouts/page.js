"use client";
import { useSettings } from "@/context/SettingsContext";
import { useState, useEffect } from "react";
import { Send, Clock } from "lucide-react";
import Modal from "@/components/ui/Modal";
import PayoutForm from "@/components/forms/PayoutForm";
import { authFetch } from "@/lib/auth-fetch";
import "./page.css";

export default function Payouts() {
  const [balanceData, setBalanceData] = useState({ availableBalance: 0, totalCollected: 0, totalPaidOut: 0 });
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currencySymbol } = useSettings();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [balRes, payoutsRes] = await Promise.all([
        authFetch("/api/payouts/balance"),
        authFetch("/api/payouts")
      ]);
      const balJson = await balRes.json();
      const payoutsJson = await payoutsRes.json();

      if (balJson.success) setBalanceData(balJson.data);
      if (payoutsJson.success) setPayouts(payoutsJson.data);
    } catch (error) {
      console.error("Failed to load payout data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePayoutSuccess = (newPayout) => {
    setPayouts([newPayout, ...payouts]);
    setBalanceData(prev => ({
      ...prev,
      availableBalance: prev.availableBalance - newPayout.amount,
      totalPaidOut: prev.totalPaidOut + newPayout.amount
    }));
    setIsModalOpen(false);
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Paid') return 'status-badge-paid';
    if (status === 'In Transit') return 'status-badge-intransit';
    return 'status-badge-pending';
  };

  return (
    <div className="payouts-container">
      <header className="payouts-header">
        <div>
          <h1>Payouts</h1>
          <p className="payouts-subtitle">Manage your collected funds and transfer them to your linked bank accounts.</p>
        </div>
      </header>

      {/* Hero Balance Card */}
      <div className="balance-card">
        <div className="balance-info">
          <h2>FinFlow Available Balance</h2>
          <div className="balance-amount">${loading ? "..." : `${currencySymbol}${balanceData.availableBalance.toFixed(2)}`}</div>
        </div>
        <div>
          <button 
            className="payout-btn" 
            onClick={() => setIsModalOpen(true)}
            disabled={loading || balanceData.availableBalance <= 0}
          >
            <Send size={18} /> Pay out funds
          </button>
        </div>
      </div>

      {/* Payout History Section */}
      <section className="payout-history-section">
        <h3>Payout History</h3>
        
        {loading ? (
          <p style={{color: "var(--color-text-secondary)"}}>Loading history...</p>
        ) : payouts.length === 0 ? (
          <div className="wave-card" style={{padding: "40px 20px", textAlign: "center"}}>
            <p style={{color: "var(--color-text-secondary)"}}>You haven&apos;t requested any payouts yet. Collect paid invoices to grow your balance.</p>
          </div>
        ) : (
          <div className="wave-card" style={{padding: 0}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Expected Arrival</th>
                  <th>Destination</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p._id}>
                    <td style={{fontWeight: 600}}>{currencySymbol}{p.amount.toFixed(2)}</td>
                    <td>
                      <span className={`payout-status-badge ${getStatusBadgeClass(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {p.status === 'In Transit' && <Clock size={12} style={{display: "inline", marginRight: "4px", verticalAlign: "middle"}} />}
                      {p.expectedArrival ? new Date(p.expectedArrival).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>{p.destinationBank} (....{p.accountMask})</td>
                    <td style={{color: "var(--color-text-secondary)", fontSize: "12px"}}>{p.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Payout Trigger Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Initiate Payout"
      >
        <PayoutForm 
          availableBalance={balanceData.availableBalance}
          onSuccess={handlePayoutSuccess} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}

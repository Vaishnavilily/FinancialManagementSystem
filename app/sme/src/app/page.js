"use client";
import { useSettings } from "@/context/SettingsContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Receipt, PiggyBank, Briefcase, TrendingUp, TrendingDown, Users } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import "./page.css";

export default function Dashboard() {
  const router = useRouter();
  const { currencySymbol } = useSettings();
  const [stats, setStats] = useState({
    invoices: 0,
    bills: 0,
    customers: 0,
    balance: 0,
    loading: true
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [invRes, billsRes, custRes, transRes] = await Promise.all([
          authFetch("/api/invoices"),
          authFetch("/api/bills"),
          authFetch("/api/customers"),
          authFetch("/api/transactions")
        ]);
        
        const invoices = await invRes.json();
        const bills = await billsRes.json();
        const customers = await custRes.json();
        const transactions = await transRes.json();
        
        let invTotal = 0;
        if (invoices.success) {
          invTotal = invoices.data.reduce((acc, inv) => acc + inv.total, 0);
        }

        let billsTotal = 0;
        if (bills.success) {
          billsTotal = bills.data.reduce((acc, b) => acc + b.total, 0);
        }

        let balance = 0;
        if (transactions.success) {
          balance = transactions.data.reduce((acc, t) => {
            return t.type === 'Income' ? acc + t.amount : acc - t.amount;
          }, 0);
        }

        setStats({
          invoices: invTotal,
          bills: billsTotal,
          customers: customers.success ? customers.data.length : 0,
          balance: balance,
          loading: false
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }
    
    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome (Finflow SME)</h1>
      </header>

      {/* NEW STATS OVERVIEW CARDS */}
      <section className="stats-overview" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="wave-card stat-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Total Invoiced</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>
            {stats.loading ? "..." : `${currencySymbol}${stats.invoices.toFixed(2)}`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: 'var(--color-success)', fontSize: '14px' }}>
            <TrendingUp size={16} /> <span>Receivables</span>
          </div>
        </div>

        <div className="wave-card stat-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Unpaid Bills</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>
            {stats.loading ? "..." : `${currencySymbol}${stats.bills.toFixed(2)}`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: 'var(--color-danger)', fontSize: '14px' }}>
            <TrendingDown size={16} /> <span>Payables</span>
          </div>
        </div>

        <div className="wave-card stat-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Net Cash Flow</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>
            {stats.loading ? "..." : `${currencySymbol}${stats.balance.toFixed(2)}`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            <span>Available Balance</span>
          </div>
        </div>

        <div className="wave-card stat-card" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Total Customers</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-main)' }}>
            {stats.loading ? "..." : stats.customers}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: 'var(--color-primary)', fontSize: '14px' }}>
            <Users size={16} /> <span>Active CRM</span>
          </div>
        </div>
      </section>

      <section className="welcome-banner">
        <h2>Where do you want to start?</h2>
        <p>Choose an action below to get up and running quickly.</p>
        
        <div className="cards-grid">
          {/* Card 1 */}
          <div className="wave-card action-card cursor-pointer" onClick={() => router.push('/invoices')}>
            <div className="card-icon-wrapper" style={{ backgroundColor: "#EBF3FA", color: "var(--color-primary)" }}>
              <Receipt size={32} />
            </div>
            <h3>Get Paid for Your Work</h3>
            <p>Create professional invoices and get paid faster.</p>
            <button className="wave-btn-primary card-action-btn">
              Create an Invoice <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 2 */}
          <div className="wave-card action-card cursor-pointer" onClick={() => router.push('/transactions')}>
            <div className="card-icon-wrapper" style={{ backgroundColor: "#F0F9E8", color: "var(--color-success)" }}>
              <PiggyBank size={32} />
            </div>
            <h3>Organize Your Finances</h3>
            <p>Track your income and expenses effortlessly.</p>
            <button className="wave-btn-secondary card-action-btn">
              Add a Transaction <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 3 */}
          <div className="wave-card action-card cursor-pointer" onClick={() => router.push('/bills')}>
            <div className="card-icon-wrapper" style={{ backgroundColor: "#FFF4E5", color: "#F2994A" }}>
              <Briefcase size={32} />
            </div>
            <h3>Log a Vendor Bill</h3>
            <p>Record an expense bill that needs to be paid.</p>
            <button className="wave-btn-secondary card-action-btn">
              Add a Bill <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <section className="dashboard-overview">
        <div className="wave-card overview-card">
          <div className="overview-header">
            <h3>Cash Flow</h3>
            <select className="overview-select">
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="placeholder-chart">
            {/* We can build a real chart later */}
            <p className="placeholder-text">Detailed chart rendering is coming soon. Use the summaries above for now.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

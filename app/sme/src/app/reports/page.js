"use client";
import { useSettings } from "@/context/SettingsContext";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, FileText, AlertCircle } from "lucide-react";
import "./page.css";

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all-time");
  const { currencySymbol } = useSettings();

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports?period=${period}`);
        const json = await res.json();
        if (json.success) {
          setReportData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [period]);

  if (loading && !reportData) {
    return (
      <div className="reports-container">
        <p>Loading financial data...</p>
      </div>
    );
  }

  const data = reportData || {
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    receivables: 0,
    payables: 0,
    expensesByCategory: []
  };

  const totalFlow = data.totalIncome + data.totalExpenses;
  const incomePercent = totalFlow > 0 ? (data.totalIncome / totalFlow) * 100 : 0;
  const expensePercent = totalFlow > 0 ? (data.totalExpenses / totalFlow) * 100 : 0;

  return (
    <div className="reports-container">
      <header className="reports-header">
        <div>
          <h1>Financial Reports</h1>
          <p className="reports-subtitle">Gain clear insights into your business financial health.</p>
        </div>
        <div>
          <select 
            className="period-select" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="all-time">All Time</option>
            <option value="last-30">Last 30 Days</option>
            <option value="past-week">Past Week</option>
          </select>
        </div>
      </header>

      {/* Summary Metrics */}
      <section className="reports-grid">
        <div className="wave-card report-card">
          <div className="report-card-title">Net Profit</div>
          <div className="report-card-value">{currencySymbol}{data.netProfit.toFixed(2)}</div>
          <div className={`report-card-trend ${data.netProfit >= 0 ? 'trend-positive' : 'trend-negative'}`}>
            {data.netProfit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>Net Earnings</span>
          </div>
        </div>

        <div className="wave-card report-card">
          <div className="report-card-title">Outstanding Receivables</div>
          <div className="report-card-value">{currencySymbol}{data.receivables.toFixed(2)}</div>
          <div className="report-card-trend trend-neutral">
            <FileText size={16} />
            <span>Unpaid Invoices</span>
          </div>
        </div>

        <div className="wave-card report-card">
          <div className="report-card-title">Accounts Payable</div>
          <div className="report-card-value">{currencySymbol}{data.payables.toFixed(2)}</div>
          <div className="report-card-trend trend-negative">
            <AlertCircle size={16} />
            <span>Unpaid Vendor Bills</span>
          </div>
        </div>

        <div className="wave-card report-card">
          <div className="report-card-title">Total Revenue</div>
          <div className="report-card-value">{currencySymbol}{data.totalIncome.toFixed(2)}</div>
          <div className="report-card-trend trend-positive">
            <DollarSign size={16} />
            <span>Total Income</span>
          </div>
        </div>
      </section>

      {/* Visual Charts Area */}
      <section className="reports-main-section">
        
        {/* Left Column: Cash Flow Gauge */}
        <div className="wave-card chart-card">
          <h2 className="chart-title">Cash Flow Overview</h2>
          
          <div className="custom-progress-container">
            <div className="progress-labels">
              <span style={{ color: "var(--color-success)" }}>Income vs Expenses</span>
            </div>
            
            {totalFlow > 0 ? (
              <div className="progress-bar-wrapper">
                <div 
                  className="progress-segment segment-income" 
                  style={{ width: `${incomePercent}%` }}
                >
                  {incomePercent > 10 ? `${Math.round(incomePercent)}%` : ''}
                </div>
                <div 
                  className="progress-segment segment-expense" 
                  style={{ width: `${expensePercent}%` }}
                >
                  {expensePercent > 10 ? `${Math.round(expensePercent)}%` : ''}
                </div>
              </div>
            ) : (
              <div className="progress-bar-wrapper" style={{ backgroundColor: "#E8EBEF" }}>
                <div className="progress-segment" style={{ width: '100%', color: "var(--color-text-secondary)" }}>
                  No transaction data
                </div>
              </div>
            )}
            
            <div className="progress-legend">
              <div className="legend-item">
                <div className="legend-dot" style={{ backgroundColor: "var(--color-success)" }}></div>
                Income ({currencySymbol}{data.totalIncome.toFixed(2)})
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ backgroundColor: "var(--color-danger)" }}></div>
                Expenses ({currencySymbol}{data.totalExpenses.toFixed(2)})
              </div>
            </div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>Summary</h3>
            <p style={{ lineHeight: '1.6', fontSize: '14px' }}>
              For the specific period selected, your business generated <strong>{currencySymbol}{data.totalIncome.toFixed(2)}</strong> in revenue and incurred <strong>{currencySymbol}{data.totalExpenses.toFixed(2)}</strong> in operational expenses.
              {data.netProfit > 0 ? " You are currently running at a profit." : data.netProfit < 0 ? " You are operating at a loss." : " You are breaking even."}
            </p>
          </div>
        </div>

        {/* Right Column: Top Expenses */}
        <div className="wave-card chart-card">
          <h2 className="chart-title">Top Expense Categories</h2>
          
          {data.expensesByCategory.length > 0 ? (
            <div className="expenses-list">
              {data.expensesByCategory.map((expense, idx) => (
                <div className="expense-item" key={idx}>
                  <div className="expense-name">
                    <div className="expense-color-tag" style={{ opacity: Math.max(0.3, 1 - idx * 0.15) }}></div>
                    {expense.name}
                  </div>
                  <div className="expense-amount">
                    {currencySymbol}{expense.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', textAlign: 'center', margin: '40px 0' }}>
              {loading ? "Loading..." : "No expense data found for this period."}
            </p>
          )}
        </div>

      </section>
    </div>
  );
}

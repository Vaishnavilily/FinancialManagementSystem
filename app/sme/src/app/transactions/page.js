"use client";
import { useSettings } from "@/context/SettingsContext";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import TransactionForm from "@/components/forms/TransactionForm";
import { authFetch } from "@/lib/auth-fetch";
import "./page.css";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const { currencySymbol } = useSettings();
  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await authFetch("/api/transactions");
        const json = await res.json();
        if (json.success) {
          setTransactions(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  const handleTransactionSaved = (savedTransaction) => {
    if (editingTransaction) {
      setTransactions(transactions.map((t) => t._id === savedTransaction._id ? savedTransaction : t));
    } else {
      setTransactions([savedTransaction, ...transactions]);
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        const res = await authFetch(`/api/transactions/${id}`, { method: "DELETE" });
        if (res.ok) {
          setTransactions(transactions.filter((t) => t._id !== id));
        }
      } catch (error) {
        console.error("Failed to delete transaction");
      }
    }
  };

  const columns = [
    {
      label: "Date",
      key: "date",
      render: (row) => new Date(row.date).toLocaleDateString()
    },
    {
      label: "Description",
      key: "description",
      className: "fw-500"
    },
    {
      label: "Category",
      key: "category",
      render: (row) => row.category || "-"
    },
    {
      label: "Amount",
      key: "amount",
      render: (row) => (
        <span className={row.type === 'Income' ? 'amount-income' : 'amount-expense'}>
          {row.type === 'Income' ? '+' : '-'}{currencySymbol}{row.amount.toFixed(2)}
        </span>
      )
    },
    {
      label: "Status",
      key: "status",
      render: (row) => (
        <span className={`status-badge status-${(row.status || 'completed').toLowerCase()}`}>
          {row.status || 'Completed'}
        </span>
      )
    },
    {
      label: "Actions",
      key: "actions",
      className: "actions-cell",
      render: (row) => (
        <>
          <button className="action-btn edit-btn" onClick={() => handleEdit(row)} title="Edit">
            <Pencil size={16} />
          </button>
          <button className="action-btn delete-btn" onClick={() => handleDelete(row._id)} title="Delete">
            <Trash2 size={16} />
          </button>
        </>
      )
    }
  ];

  return (
    <div className="transactions-container">
      <header className="transactions-header">
        <div>
          <h1>Transactions</h1>
          <p className="subtitle">View and add your income and expenses.</p>
        </div>
        <button 
          className="wave-btn-primary create-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} /> Add Transaction
        </button>
      </header>

      <DataTable 
        data={transactions} 
        columns={columns} 
        loading={loading}
        emptyMessage="No transactions found. Add a transaction to start tracking."
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }}
        title={editingTransaction ? "Edit Transaction" : "Add Income/Expense"}
      >
        <TransactionForm 
          initialData={editingTransaction}
          onSuccess={handleTransactionSaved} 
          onCancel={() => { setIsModalOpen(false); setEditingTransaction(null); }} 
        />
      </Modal>
    </div>
  );
}

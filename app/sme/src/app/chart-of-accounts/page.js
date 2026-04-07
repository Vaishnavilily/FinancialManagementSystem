"use client";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import AccountForm from "@/components/forms/AccountForm";
import { authFetch } from "@/lib/auth-fetch";
import "./page.css";

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await authFetch("/api/accounts");
        const json = await res.json();
        if (json.success) {
          setAccounts(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch accounts");
      } finally {
        setLoading(false);
      }
    }
    fetchAccounts();
  }, []);

  const handleAccountSaved = (savedAccount) => {
    let freshAccounts = [];
    if (editingAccount) {
      freshAccounts = accounts.map((a) => a._id === savedAccount._id ? savedAccount : a);
    } else {
      freshAccounts = [...accounts, savedAccount];
    }
    setAccounts(freshAccounts.sort((a, b) => a.code.localeCompare(b.code)));
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      try {
        const res = await authFetch(`/api/accounts/${id}`, { method: "DELETE" });
        if (res.ok) {
          setAccounts(accounts.filter((a) => a._id !== id));
        }
      } catch (error) {
        console.error("Failed to delete account");
      }
    }
  };

  const columns = [
    {
      label: "Code",
      key: "code",
      className: "fw-600"
    },
    {
      label: "Name",
      key: "name",
      className: "fw-500"
    },
    {
      label: "Type",
      key: "type",
      render: (row) => (
        <span className={`type-badge type-${row.type.toLowerCase()}`}>
          {row.type}
        </span>
      )
    },
    {
      label: "Balance",
      key: "balance",
      className: "fw-600",
      render: (row) => `$${(row.balance || 0).toFixed(2)}`
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
    <div className="accounts-container">
      <header className="accounts-header">
        <div>
          <h1>Chart of Accounts</h1>
          <p className="subtitle">Manage the foundational categories of your accounting system.</p>
        </div>
        <button 
          className="wave-btn-primary create-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} /> Add Account
        </button>
      </header>

      <DataTable 
        data={accounts} 
        columns={columns} 
        loading={loading}
        emptyMessage="Your chart of accounts is empty. Add a new account to categorize transactions."
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingAccount(null); }}
        title={editingAccount ? "Edit Account" : "Add New Account"}
      >
        <AccountForm 
          initialData={editingAccount}
          onSuccess={handleAccountSaved} 
          onCancel={() => { setIsModalOpen(false); setEditingAccount(null); }} 
        />
      </Modal>
    </div>
  );
}

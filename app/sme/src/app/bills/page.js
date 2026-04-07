"use client";
import { useSettings } from "@/context/SettingsContext";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import BillForm from "@/components/forms/BillForm";
import { authFetch } from "@/lib/auth-fetch";
import "./page.css";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const { currencySymbol } = useSettings();
  useEffect(() => {
    async function fetchBills() {
      try {
        const res = await authFetch("/api/bills");
        const json = await res.json();
        if (json.success) {
          setBills(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch bills");
      } finally {
        setLoading(false);
      }
    }
    fetchBills();
  }, []);

  const handleBillSaved = (savedBill) => {
    if (editingBill) {
      setBills(bills.map((b) => b._id === savedBill._id ? savedBill : b));
    } else {
      setBills([savedBill, ...bills]);
    }
    setIsModalOpen(false);
    setEditingBill(null);
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        const res = await authFetch(`/api/bills/${id}`, { method: "DELETE" });
        if (res.ok) {
          setBills(bills.filter((b) => b._id !== id));
        }
      } catch (error) {
        console.error("Failed to delete bill");
      }
    }
  };

  const columns = [
    {
      label: "Date",
      key: "issueDate",
      render: (row) => new Date(row.issueDate).toLocaleDateString()
    },
    {
      label: "Bill Number",
      key: "billNumber",
      className: "fw-600"
    },
    {
      label: "Vendor Name",
      key: "vendorName"
    },
    {
      label: "Amount",
      key: "total",
      className: "fw-500",
      render: (row) => `${currencySymbol}${row.total.toFixed(2)}`
    },
    {
      label: "Status",
      key: "status",
      render: (row) => (
        <span className={`status-badge status-${row.status.toLowerCase()}`}>
          {row.status}
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
    <div className="bills-container">
      <header className="bills-header">
        <div>
          <h1>Bills</h1>
          <p className="subtitle">Track and manage your vendor bills and expenses.</p>
        </div>
        <button 
          className="wave-btn-primary create-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} /> Create a Bill
        </button>
      </header>

      <DataTable 
        data={bills} 
        columns={columns} 
        loading={loading}
        emptyMessage="Create your first bill to keep track of expenses."
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingBill(null); }}
        title={editingBill ? "Edit Bill" : "Create New Bill"}
      >
        <BillForm 
          initialData={editingBill}
          onSuccess={handleBillSaved} 
          onCancel={() => { setIsModalOpen(false); setEditingBill(null); }} 
        />
      </Modal>
    </div>
  );
}

"use client";
import { useSettings } from "@/context/SettingsContext";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import EstimateForm from "@/components/forms/EstimateForm";
import { authFetch } from "@/lib/auth-fetch";
import "./page.css";

export default function Estimates() {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState(null);
  const { currencySymbol } = useSettings();
  useEffect(() => {
    async function fetchEstimates() {
      try {
        const res = await authFetch("/api/estimates");
        const json = await res.json();
        if (json.success) {
          setEstimates(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch estimates");
      } finally {
        setLoading(false);
      }
    }
    fetchEstimates();
  }, []);

  const handleEstimateSaved = (savedEstimate) => {
    if (editingEstimate) {
      setEstimates(estimates.map((e) => e._id === savedEstimate._id ? savedEstimate : e));
    } else {
      setEstimates([savedEstimate, ...estimates]);
    }
    setIsModalOpen(false);
    setEditingEstimate(null);
  };

  const handleEdit = (estimate) => {
    setEditingEstimate(estimate);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this estimate?")) {
      try {
        const res = await authFetch(`/api/estimates/${id}`, { method: "DELETE" });
        if (res.ok) {
          setEstimates(estimates.filter((e) => e._id !== id));
        }
      } catch (error) {
        console.error("Failed to delete estimate");
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
      label: "Estimate Number",
      key: "estimateNumber",
      className: "fw-600"
    },
    {
      label: "Customer Name",
      key: "customerName"
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
    <div className="estimates-container">
      <header className="estimates-header">
        <div>
          <h1>Estimates</h1>
          <p className="subtitle">Draft, send, and manage quotes for your customers.</p>
        </div>
        <button 
          className="wave-btn-primary create-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} /> Create Estimate
        </button>
      </header>

      <DataTable 
        data={estimates} 
        columns={columns} 
        loading={loading}
        emptyMessage="You haven't created any estimates yet."
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingEstimate(null); }}
        title={editingEstimate ? "Edit Estimate" : "Create New Estimate"}
      >
        <EstimateForm 
          initialData={editingEstimate}
          onSuccess={handleEstimateSaved} 
          onCancel={() => { setIsModalOpen(false); setEditingEstimate(null); }} 
        />
      </Modal>
    </div>
  );
}

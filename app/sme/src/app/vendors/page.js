"use client";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import VendorForm from "@/components/forms/VendorForm";
import { authFetch } from "@/lib/auth-fetch";
import "./page.css";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  useEffect(() => {
    async function fetchVendors() {
      try {
        const res = await authFetch("/api/vendors");
        const json = await res.json();
        if (json.success) {
          setVendors(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch vendors");
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, []);

  const handleVendorSaved = (savedVendor) => {
    if (editingVendor) {
      setVendors(vendors.map((v) => v._id === savedVendor._id ? savedVendor : v));
    } else {
      setVendors([savedVendor, ...vendors]);
    }
    setIsModalOpen(false);
    setEditingVendor(null);
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        const res = await authFetch(`/api/vendors/${id}`, { method: "DELETE" });
        if (res.ok) {
          setVendors(vendors.filter((v) => v._id !== id));
        }
      } catch (error) {
        console.error("Failed to delete vendor");
      }
    }
  };

  const columns = [
    {
      label: "Name",
      key: "name",
      className: "fw-600"
    },
    {
      label: "Category",
      key: "category",
      render: (row) => (
        <span className="category-badge">{row.category || "General"}</span>
      )
    },
    {
      label: "Email",
      key: "email",
      render: (row) => row.email || "-"
    },
    {
      label: "Total Spent",
      key: "totalSpent",
      className: "fw-500",
      render: (row) => `$${(row.totalSpent || 0).toFixed(2)}`
    },
    {
      label: "Status",
      key: "status",
      render: (row) => (
        <span className={`status-badge status-${(row.status || 'active').toLowerCase()}`}>
          {row.status || 'Active'}
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
    <div className="vendors-container">
      <header className="vendors-header">
        <div>
          <h1>Vendors</h1>
          <p className="subtitle">Manage suppliers, service providers, and contractors.</p>
        </div>
        <button 
          className="wave-btn-primary create-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} /> Add a Vendor
        </button>
      </header>

      <DataTable 
        data={vendors} 
        columns={columns} 
        loading={loading}
        emptyMessage="Add your first vendor to organize your expenses."
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingVendor(null); }}
        title={editingVendor ? "Edit Vendor" : "Add New Vendor"}
      >
        <VendorForm 
          initialData={editingVendor}
          onSuccess={handleVendorSaved} 
          onCancel={() => { setIsModalOpen(false); setEditingVendor(null); }} 
        />
      </Modal>
    </div>
  );
}

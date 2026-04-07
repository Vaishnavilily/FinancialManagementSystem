"use client";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import CustomerForm from "@/components/forms/CustomerForm";
import { authFetch } from "@/lib/auth-fetch";
import "./page.css";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await authFetch("/api/customers");
        const json = await res.json();
        if (json.success) {
          setCustomers(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch customers");
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const handleCustomerSaved = (savedCustomer) => {
    if (editingCustomer) {
      setCustomers(customers.map((c) => c._id === savedCustomer._id ? savedCustomer : c));
    } else {
      setCustomers([savedCustomer, ...customers]);
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        const res = await authFetch(`/api/customers/${id}`, { method: "DELETE" });
        if (res.ok) {
          setCustomers(customers.filter((c) => c._id !== id));
        }
      } catch (error) {
        console.error("Failed to delete customer");
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
      label: "Email",
      key: "email",
      render: (row) => row.email || "-"
    },
    {
      label: "Phone",
      key: "phone",
      render: (row) => row.phone || "-"
    },
    {
      label: "Total Billed",
      key: "totalBilled",
      className: "fw-500",
      render: (row) => `$${(row.totalBilled || 0).toFixed(2)}`
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
    <div className="customers-container">
      <header className="customers-header">
        <div>
          <h1>Customers</h1>
          <p className="subtitle">Manage your client directory and contact details.</p>
        </div>
        <button 
          className="wave-btn-primary create-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} /> Add a Customer
        </button>
      </header>

      <DataTable 
        data={customers} 
        columns={columns} 
        loading={loading}
        emptyMessage="Add your first customer to build your directory."
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingCustomer(null); }}
        title={editingCustomer ? "Edit Customer" : "Add New Customer"}
      >
        <CustomerForm 
          initialData={editingCustomer}
          onSuccess={handleCustomerSaved} 
          onCancel={() => { setIsModalOpen(false); setEditingCustomer(null); }} 
        />
      </Modal>
    </div>
  );
}

"use client";
import { useSettings } from "@/context/SettingsContext"
import { useState, useEffect } from "react";
import { Plus, Search, FileText, Pencil, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import InvoiceForm from "@/components/forms/InvoiceForm";
import { authFetch } from "@/lib/auth-fetch";
import "./invoices.css";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const { currencySymbol } = useSettings();

  const handleInvoiceSaved = (savedInvoice) => {
    if (editingInvoice) {
      setInvoices(invoices.map((inv) => inv._id === savedInvoice._id ? savedInvoice : inv));
    } else {
      setInvoices([savedInvoice, ...invoices]);
    }
    setIsModalOpen(false);
    setEditingInvoice(null);
  };

  const handleEdit = (inv) => {
    if (inv.status === 'Paid') {
      alert("Cannot edit a paid invoice.");
      return;
    }
    setEditingInvoice(inv);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        const res = await authFetch(`/api/invoices/${id}`, { method: "DELETE" });
        if (res.ok) {
          setInvoices(invoices.filter((inv) => inv._id !== id));
        }
      } catch (error) {
        console.error("Failed to delete invoice");
      }
    }
  };

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await authFetch("/api/invoices");
        const json = await res.json();
        if (json.success) {
          setInvoices(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch invoices");
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  return (
    <div className="invoices-container">
      <header className="invoices-header">
        <div>
          <h1>Invoices</h1>
          <p className="subtitle">Manage and track your customer invoices.</p>
        </div>
        <button 
          className="wave-btn-primary create-btn"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} /> Create an Invoice
        </button>
      </header>

      <div className="invoices-toolbar">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search invoices..." />
        </div>
        <select className="filter-select">
          <option>All Statuses</option>
          <option>Draft</option>
          <option>Sent</option>
          <option>Paid</option>
        </select>
      </div>

      <div className="wave-card table-card">
        {loading ? (
          <p className="empty-state-text">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <FileText size={48} color="var(--color-primary)" />
            </div>
            <h3>No invoices yet</h3>
            <p>Create your first invoice to get paid faster.</p>
            <button 
              className="wave-btn-secondary"
              onClick={() => setIsModalOpen(true)}
            >
              Create an Invoice
            </button>
          </div>
        ) : (
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Invoice Number</th>
                <th>Customer Name</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td>{new Date(inv.issueDate).toLocaleDateString()}</td>
                  <td className="fw-600">{inv.invoiceNumber}</td>
                  <td>{inv.customerName}</td>
                  <td className="fw-500">{currencySymbol}{inv.total.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${inv.status.toLowerCase()}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="action-btn edit-btn" onClick={() => handleEdit(inv)} title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(inv._id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingInvoice(null); }}
        title={editingInvoice ? "Edit Invoice" : "Create New Invoice"}
      >
        <InvoiceForm 
          initialData={editingInvoice}
          onSuccess={handleInvoiceSaved} 
          onCancel={() => { setIsModalOpen(false); setEditingInvoice(null); }} 
        />
      </Modal>
    </div>
  );
}

import { useState } from "react";
import "./forms.css";

export default function TransactionForm({ onSuccess, onCancel, initialData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    description: initialData?.description || "",
    amount: initialData?.amount || "",
    type: initialData?.type || "Expense",
    category: initialData?.category || "General"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid positive amount");
      setLoading(false);
      return;
    }

    const payload = {
      date: new Date(formData.date),
      description: formData.description,
      amount: amountNum,
      type: formData.type,
      category: formData.category,
      status: "Completed"
    };

    try {
      const url = initialData ? `/api/transactions/${initialData._id}` : "/api/transactions";
      const method = initialData ? "PUT" : "POST";
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create transaction");
      }
      
      onSuccess(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      
      <div className="form-row">
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            className="form-control"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select 
            name="type" 
            className="form-control" 
            value={formData.type} 
            onChange={handleChange}
          >
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          name="description"
          className="form-control"
          value={formData.description}
          onChange={handleChange}
          placeholder="e.g. Office Supplies"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Amount ($)</label>
          <input
            type="number"
            name="amount"
            className="form-control"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            required
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            name="category"
            className="form-control"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g. Utilities"
          />
        </div>
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          className="wave-btn-secondary" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="wave-btn-primary"
          disabled={loading}
        >
          {loading ? (initialData ? "Updating..." : "Adding...") : (initialData ? "Update Transaction" : "Add Transaction")}
        </button>
      </div>
    </form>
  );
}

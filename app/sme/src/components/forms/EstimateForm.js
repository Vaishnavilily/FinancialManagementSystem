import { useState } from "react";
import "./forms.css";

export default function EstimateForm({ onSuccess, onCancel, initialData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    estimateNumber: initialData?.estimateNumber || `EST-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: initialData?.customerName || "",
    amount: initialData?.total || "",
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
      setError("Please enter a valid amount");
      setLoading(false);
      return;
    }

    const payload = {
      estimateNumber: formData.estimateNumber,
      customerName: formData.customerName,
      subtotal: amountNum,
      total: amountNum,
      items: [{ description: "Consulting Services", quantity: 1, price: amountNum, amount: amountNum }]
    };

    try {
      const url = initialData ? `/api/estimates/${initialData._id}` : "/api/estimates";
      const method = initialData ? "PUT" : "POST";
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create estimate");
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
          <label>Estimate Number</label>
          <input
            type="text"
            name="estimateNumber"
            className="form-control"
            value={formData.estimateNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Customer Name</label>
          <input
            type="text"
            name="customerName"
            className="form-control"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="e.g. Acme Corp"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Total Estimate Amount ($)</label>
        <input
          type="number"
          name="amount"
          className="form-control"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          required
        />
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
          {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Estimate" : "Create Estimate")}
        </button>
      </div>
    </form>
  );
}

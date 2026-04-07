import { useState } from "react";
import "./forms.css";

export default function BillForm({ onSuccess, onCancel, initialData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    billNumber: initialData?.billNumber || `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
    vendorName: initialData?.vendorName || "",
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
      billNumber: formData.billNumber,
      vendorName: formData.vendorName,
      subtotal: amountNum,
      total: amountNum,
      items: [{ description: "General Expense", quantity: 1, price: amountNum, amount: amountNum }]
    };

    try {
      const url = initialData ? `/api/bills/${initialData._id}` : "/api/bills";
      const method = initialData ? "PUT" : "POST";
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create bill");
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
          <label>Bill Number</label>
          <input
            type="text"
            name="billNumber"
            className="form-control"
            value={formData.billNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Vendor Name</label>
          <input
            type="text"
            name="vendorName"
            className="form-control"
            value={formData.vendorName}
            onChange={handleChange}
            placeholder="e.g. Server Hosting Co"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Total Amount ($)</label>
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
          {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Bill" : "Create Bill")}
        </button>
      </div>
    </form>
  );
}

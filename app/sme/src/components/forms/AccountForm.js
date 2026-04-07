import { useState } from "react";
import "./forms.css";

export default function AccountForm({ onSuccess, onCancel, initialData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    code: initialData?.code || "",
    name: initialData?.name || "",
    type: initialData?.type || "Asset",
    balance: initialData?.balance || "",
    description: initialData?.description || ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      code: formData.code,
      name: formData.name,
      type: formData.type,
      balance: parseFloat(formData.balance) || 0,
      description: formData.description
    };

    try {
      const url = initialData ? `/api/accounts/${initialData._id}` : "/api/accounts";
      const method = initialData ? "PUT" : "POST";
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create account");
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
          <label>Account Code</label>
          <input
            type="text"
            name="code"
            className="form-control"
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g. 1000"
            required
          />
        </div>
        <div className="form-group">
          <label>Account Type</label>
          <select 
            name="type" 
            className="form-control" 
            value={formData.type} 
            onChange={handleChange}
          >
            <option value="Asset">Asset</option>
            <option value="Liability">Liability</option>
            <option value="Equity">Equity</option>
            <option value="Revenue">Revenue</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Account Name</label>
        <input
          type="text"
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Cash in Bank"
          required
        />
      </div>

      <div className="form-group">
        <label>Starting Balance ($) - Optional</label>
        <input
          type="number"
          name="balance"
          className="form-control"
          value={formData.balance}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
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
          {loading ? (initialData ? "Updating..." : "Adding...") : (initialData ? "Update Account" : "Add Account")}
        </button>
      </div>
    </form>
  );
}

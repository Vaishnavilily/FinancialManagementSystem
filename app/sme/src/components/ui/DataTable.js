import { Layers } from "lucide-react";
import "./DataTable.css";

export default function DataTable({ data, columns, emptyMessage, loading = false }) {
  if (loading) {
    return (
      <div className="wave-card table-card table-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="wave-card table-card empty-state">
        <div className="empty-icon-wrapper">
          <Layers size={48} color="var(--color-primary)" />
        </div>
        <h3>No records found</h3>
        <p>{emptyMessage || "Create your first record to see it here."}</p>
      </div>
    );
  }

  return (
    <div className="wave-card table-card">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={row._id || rowIdx}>
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={col.className}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

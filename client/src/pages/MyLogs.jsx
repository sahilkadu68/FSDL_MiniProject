import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const CATEGORY_ICONS = { transport: '🚗', food: '🍽️', energy: '⚡' };

export default function MyLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.category = filter;

      // Get last 30 days
      const from = new Date();
      from.setDate(from.getDate() - 30);
      params.from = from.toISOString();

      const { data } = await api.get('/logs', { params });
      setLogs(data);
    } catch (err) {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this log entry?')) return;
    try {
      await api.delete(`/logs/${id}`);
      setLogs(logs.filter(l => l._id !== id));
      toast.success('Log deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (log) => {
    setEditingId(log._id);
    setEditQuantity(log.quantity.toString());
  };

  const handleSaveEdit = async (log) => {
    try {
      const { data } = await api.put(`/logs/${log._id}`, { quantity: parseFloat(editQuantity) });
      setLogs(logs.map(l => l._id === log._id ? data : l));
      setEditingId(null);
      toast.success('Log updated');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatSubcategory = (sub) => {
    return sub.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const totalCO2 = logs.reduce((sum, l) => sum + l.co2eKg, 0);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading logs...</p>
      </div>
    );
  }

  return (
    <div className="logs-page">
      <div className="page-header">
        <div>
          <h1>My Activity Logs</h1>
          <p className="subtitle">{logs.length} entries • {totalCO2.toFixed(1)} kg CO₂e total</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['all', 'transport', 'food', 'energy'].map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => { setFilter(f); setLoading(true); }}
          >
            {f === 'all' ? '📋 All' : `${CATEGORY_ICONS[f]} ${f.charAt(0).toUpperCase() + f.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Logs List */}
      {logs.length === 0 ? (
        <div className="empty-state">
          <p>No logs found. Start tracking your activities!</p>
        </div>
      ) : (
        <div className="logs-list">
          {logs.map(log => (
            <div key={log._id} className="log-item">
              <div className="log-icon">{CATEGORY_ICONS[log.category]}</div>
              <div className="log-details">
                <div className="log-name">{formatSubcategory(log.subcategory)}</div>
                <div className="log-meta">
                  {formatDate(log.loggedAt)} • {log.category}
                </div>
              </div>
              <div className="log-right">
                {editingId === log._id ? (
                  <div className="edit-inline">
                    <input
                      type="number"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      className="edit-input"
                      autoFocus
                    />
                    <button className="btn-small btn-save" onClick={() => handleSaveEdit(log)}>✓</button>
                    <button className="btn-small btn-cancel" onClick={() => setEditingId(null)}>✕</button>
                  </div>
                ) : (
                  <>
                    <div className="log-quantity">{log.quantity} units</div>
                    <div className="log-co2">{log.co2eKg.toFixed(2)} kg</div>
                    <div className="log-actions">
                      <button className="btn-icon" onClick={() => handleEdit(log)} title="Edit">✏️</button>
                      <button className="btn-icon" onClick={() => handleDelete(log._id)} title="Delete">🗑️</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

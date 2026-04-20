import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function LogActivity() {
  const [factors, setFactors] = useState({});
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFactors();
  }, []);

  const fetchFactors = async () => {
    try {
      const { data } = await api.get('/logs/factors');
      setFactors(data.factors);
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const selectedFactor = factors[category]?.find(f => f.key === subcategory);
  const co2Preview = selectedFactor && quantity ? (parseFloat(quantity) * selectedFactor.factor).toFixed(2) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !subcategory || !quantity) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/logs', { category, subcategory, quantity: parseFloat(quantity), loggedAt: logDate });
      toast.success(`Logged ${co2Preview} kg CO₂e ✓`);
      // Reset for another entry
      setSubcategory('');
      setQuantity('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons = { transport: '🚗', food: '🍽️', energy: '⚡' };
  const categoryLabels = { transport: 'Transport', food: 'Food & Diet', energy: 'Home Energy' };

  return (
    <div className="log-page">
      <div className="page-header">
        <div>
          <h1>Log Activity</h1>
          <p className="subtitle">Record your daily carbon-producing activities</p>
        </div>
      </div>

      <div className="log-form-container">
        <form onSubmit={handleSubmit} className="log-form">
          {/* Step 1: Category */}
          <div className="form-section">
            <label className="form-section-label">1. Choose Category</label>
            <div className="category-pills">
              {Object.keys(factors).map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`category-pill ${category === cat ? 'active' : ''}`}
                  onClick={() => { setCategory(cat); setSubcategory(''); setQuantity(''); }}
                >
                  <span className="pill-icon">{categoryIcons[cat]}</span>
                  <span>{categoryLabels[cat]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Subcategory */}
          {category && (
            <div className="form-section fade-in">
              <label className="form-section-label">2. Select Activity</label>
              <div className="subcategory-grid">
                {factors[category]?.map(sub => (
                  <button
                    key={sub.key}
                    type="button"
                    className={`subcategory-card ${subcategory === sub.key ? 'active' : ''}`}
                    onClick={() => { setSubcategory(sub.key); setQuantity(''); }}
                  >
                    <span className="subcat-name">{sub.label}</span>
                    <span className="subcat-factor">{sub.factor} kg/{sub.unit}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Quantity */}
          {subcategory && (
            <div className="form-section fade-in">
              <label className="form-section-label">3. Enter Quantity</label>
              <div className="quantity-row">
                <div className="quantity-input-group">
                  <input
                    type="number"
                    id="log-quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="any"
                    autoFocus
                    className="quantity-input"
                  />
                  <span className="quantity-unit">{selectedFactor?.unit}</span>
                </div>

                <div className="form-group">
                  <label htmlFor="log-date" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>Date</label>
                  <input
                    type="date"
                    id="log-date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="date-input"
                  />
                </div>
              </div>

              {/* Live CO2 Preview */}
              {co2Preview && (
                <div className="co2-preview fade-in">
                  <div className="co2-preview-inner">
                    <span className="co2-label">Estimated CO₂e</span>
                    <span className="co2-value">{co2Preview} kg</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          {subcategory && quantity && (
            <div className="form-actions fade-in">
              <button type="submit" className="btn-primary btn-full" disabled={loading}>
                {loading ? 'Logging...' : `Log ${co2Preview} kg CO₂e`}
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/')}>
                Back to Dashboard
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

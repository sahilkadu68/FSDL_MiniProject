import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';
import api from '../utils/api';

const SLIDER_CONFIG = {
  diet: {
    label: 'Diet',
    icon: '🍽️',
    levels: ['Heavy Meat', 'Mixed', 'Vegetarian', 'Vegan'],
    colors: ['#ef4444', '#f59e0b', '#22c55e', '#10b981'],
  },
  transport: {
    label: 'Transport',
    icon: '🚗',
    levels: ['Mostly Car', 'Mix', 'Public Transit', 'Bike / Walk'],
    colors: ['#ef4444', '#f59e0b', '#22c55e', '#10b981'],
  },
  energy: {
    label: 'Energy Usage',
    icon: '⚡',
    levels: ['High', 'Medium', 'Low', 'Minimal'],
    colors: ['#ef4444', '#f59e0b', '#22c55e', '#10b981'],
  },
};

export default function Simulator() {
  const [sliders, setSliders] = useState({ diet: 0, transport: 0, energy: 0 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSliderChange = (key, value) => {
    setSliders(prev => ({ ...prev, [key]: parseInt(value) }));
  };

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/ai/simulate', sliders);
      setResult(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const comparisonData = result ? [
    { name: 'Current', value: result.currentMonthly, color: '#6366f1' },
    { name: 'Projected', value: result.projectedMonthly, color: result.percentChange < 0 ? '#10b981' : '#ef4444' },
  ] : [];

  return (
    <div className="simulator-page">
      <div className="page-header">
        <div>
          <h1>✨ What-If Simulator</h1>
          <p className="subtitle">See how lifestyle changes could reduce your carbon footprint</p>
        </div>
      </div>

      <div className="simulator-layout">
        {/* Sliders Panel */}
        <div className="simulator-controls glass-card">
          <h2>Adjust Your Lifestyle</h2>
          <p className="controls-subtitle">Move the sliders to explore different scenarios</p>

          {Object.entries(SLIDER_CONFIG).map(([key, config]) => (
            <div key={key} className="slider-group">
              <div className="slider-header">
                <span className="slider-label">{config.icon} {config.label}</span>
                <span
                  className="slider-value-badge"
                  style={{ background: config.colors[sliders[key]] + '22', color: config.colors[sliders[key]] }}
                >
                  {config.levels[sliders[key]]}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                value={sliders[key]}
                onChange={(e) => handleSliderChange(key, e.target.value)}
                className="lifestyle-slider"
                style={{ '--slider-color': config.colors[sliders[key]] }}
              />
              <div className="slider-labels">
                {config.levels.map((level, i) => (
                  <span key={i} className={`slider-tick ${sliders[key] === i ? 'active' : ''}`}>
                    {level}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <button
            className="btn-primary btn-full simulate-btn"
            onClick={handleSimulate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner-small"></span>
                Simulating...
              </>
            ) : '🔮 Simulate'}
          </button>
        </div>

        {/* Results Panel */}
        <div className="simulator-results">
          {result ? (
            <>
              <div className="result-card glass-card fade-in">
                <h2>Simulation Results</h2>
                <div className="result-stats">
                  <div className="result-stat">
                    <span className="result-label">Current Monthly</span>
                    <span className="result-number">{result.currentMonthly.toFixed(1)} kg</span>
                  </div>
                  <div className="result-arrow">→</div>
                  <div className="result-stat">
                    <span className="result-label">Projected Monthly</span>
                    <span className="result-number projected">{result.projectedMonthly.toFixed(1)} kg</span>
                  </div>
                  <div className={`result-change ${result.percentChange < 0 ? 'positive' : 'negative'}`}>
                    {result.percentChange > 0 ? '+' : ''}{result.percentChange.toFixed(1)}%
                  </div>
                </div>

                {/* Before/After Bar Chart */}
                <div className="chart-container" style={{ marginTop: '1.5rem' }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={comparisonData} barSize={60}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 14 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} unit=" kg" />
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }}
                        formatter={(value) => [`${value.toFixed(1)} kg`, 'CO₂e/month']}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {comparisonData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Explanation */}
              {result.explanation && (
                <div className="explanation-card glass-card fade-in">
                  <div className="explanation-header">
                    <span>🤖</span>
                    <span>AI Insight</span>
                  </div>
                  <p className="explanation-text">{result.explanation}</p>
                </div>
              )}
            </>
          ) : (
            <div className="simulator-empty glass-card">
              <div className="empty-illustration">🌍</div>
              <h3>Ready to Explore?</h3>
              <p>Adjust the sliders on the left and click <strong>Simulate</strong> to see how your choices impact the planet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

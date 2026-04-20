import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const CATEGORY_COLORS = {
  transport: '#6366f1',
  food: '#f59e0b',
  energy: '#10b981',
};

const CATEGORY_ICONS = {
  transport: '🚗',
  food: '🍽️',
  energy: '⚡',
};

function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 800;
    const start = 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (value - start) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [value]);

  return <span>{display.toFixed(1)}{suffix}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const { data } = await api.get('/logs/summary');
      setSummary(data);
    } catch (err) {
      console.error('Failed to load summary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const pieData = summary?.categoryBreakdown?.map(c => ({
    name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    value: c.total,
    color: CATEGORY_COLORS[c.category],
    icon: CATEGORY_ICONS[c.category],
  })) || [];

  const dailyAvg = summary?.week ? (summary.week / 7) : 0;
  const globalAvg = summary?.globalAvgDaily || 4.0;
  const comparisonPct = globalAvg > 0 ? ((dailyAvg - globalAvg) / globalAvg * 100) : 0;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="subtitle">Here's your carbon footprint overview</p>
        </div>
        <Link to="/log" className="btn-primary">
          + Log Activity
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-label">Today</div>
          <div className="stat-value">
            <AnimatedNumber value={summary?.today || 0} suffix=" kg" />
          </div>
          <div className="stat-unit">CO₂e</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">This Week</div>
          <div className="stat-value">
            <AnimatedNumber value={summary?.week || 0} suffix=" kg" />
          </div>
          <div className="stat-unit">CO₂e</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">This Month</div>
          <div className="stat-value">
            <AnimatedNumber value={summary?.month || 0} suffix=" kg" />
          </div>
          <div className="stat-unit">CO₂e</div>
        </div>
        <div className={`stat-card ${comparisonPct > 0 ? 'stat-warning' : 'stat-good'}`}>
          <div className="stat-label">vs Global Avg</div>
          <div className="stat-value">
            {dailyAvg > 0 ? (
              <>{comparisonPct > 0 ? '+' : ''}{comparisonPct.toFixed(0)}%</>
            ) : '—'}
          </div>
          <div className="stat-unit">{dailyAvg > 0 ? (comparisonPct > 0 ? 'Above average' : 'Below average') : 'No data yet'}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Donut Chart */}
        <div className="chart-card">
          <h2>Emissions by Category</h2>
          {pieData.length > 0 ? (
            <>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }}
                      formatter={(value) => [`${value.toFixed(2)} kg`, 'CO₂e']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                {pieData.map((entry, i) => (
                  <div key={i} className="legend-item">
                    <span className="legend-dot" style={{ background: entry.color }}></span>
                    <span>{entry.icon} {entry.name}</span>
                    <span className="legend-value">{entry.value.toFixed(1)} kg</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>No data yet. <Link to="/log">Log your first activity!</Link></p>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="chart-card">
          <h2>Last 7 Days</h2>
          {summary?.dailyData?.some(d => d.total > 0) ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary.dailyData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} unit=" kg" />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }}
                    formatter={(value) => [`${value.toFixed(2)} kg`, 'CO₂e']}
                    labelFormatter={(label) => `Day: ${label}`}
                  />
                  <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              <p>Start logging to see your weekly trend 📈</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Tip Card */}
      {summary?.tip && (
        <div className="tip-card">
          <div className="tip-header">
            <span className="tip-icon">💡</span>
            <span className="tip-title">{summary.tip.message}</span>
          </div>
          <p className="tip-text">{summary.tip.tip}</p>
        </div>
      )}
    </div>
  );
}

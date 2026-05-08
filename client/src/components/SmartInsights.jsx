import { useEffect, useState } from 'react';
import './SmartInsights.css';

export default function SmartInsights({ insights, dailyAverage }) {
  if (!insights || !insights.insights || insights.insights.length === 0) {
    return (
      <div className="insights-card">
        <h2>📊 Smart Insights</h2>
        <p className="insights-empty">Start logging activities to see your insights!</p>
      </div>
    );
  }

  return (
    <div className="insights-card">
      <h2>📊 Smart Insights</h2>
      <p className="insights-message">{insights.message}</p>
      
      <div className="insights-breakdown">
        {insights.insights.map((item) => (
          <div key={item.category} className={`insight-item impact-${item.impact.toLowerCase()}`}>
            <div className="insight-header">
              <span className="insight-icon">{item.icon}</span>
              <span className="insight-name">
                {item.category.charAt(0).toUpperCase()}{item.category.slice(1)}
              </span>
              <span className={`insight-impact impact-badge-${item.impact.toLowerCase()}`}>
                {item.impact}
              </span>
            </div>
            <div className="insight-bar">
              <div 
                className="insight-progress" 
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
            <div className="insight-stats">
              <span className="insight-percentage">{item.percentage.toFixed(1)}%</span>
              <span className="insight-total">{item.total.toFixed(1)} kg CO₂e</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="insights-total">
        <span>Total this month:</span>
        <strong>{insights.totalEmissions.toFixed(1)} kg CO₂e</strong>
      </div>
    </div>
  );
}

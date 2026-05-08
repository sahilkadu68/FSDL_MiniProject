import { useState } from 'react';

export default function SmartSuggestions({ suggestions }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="suggestions-card">
        <h2>💡 Smart Suggestions</h2>
        <p className="suggestions-empty">Log more activities to get personalized suggestions</p>
      </div>
    );
  }

  return (
    <div className="suggestions-card">
      <h2>💡 Smart Suggestions</h2>
      <p className="suggestions-subtitle">Top recommendations to reduce your emissions</p>

      <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className={`suggestion-item suggestion-priority-${suggestion.priority}`}
          >
            <div
              className="suggestion-header"
              onClick={() => setExpandedId(expandedId === suggestion.id ? null : suggestion.id)}
            >
              <div className="suggestion-title-group">
                <span className="suggestion-index">#{index + 1}</span>
                <span className="suggestion-title">{suggestion.title}</span>
              </div>
              <span className={`suggestion-impact impact-${suggestion.impact.toLowerCase()}`}>
                {suggestion.impact} Impact
              </span>
              <span className="suggestion-toggle">
                {expandedId === suggestion.id ? '▼' : '▶'}
              </span>
            </div>

            {expandedId === suggestion.id && (
              <div className="suggestion-body">
                <p className="suggestion-description">{suggestion.description}</p>
                <button className="btn-suggestion-action">
                  Learn More →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="suggestions-footer">
        <p>💪 Start with #1 and work your way down for maximum impact!</p>
      </div>
    </div>
  );
}

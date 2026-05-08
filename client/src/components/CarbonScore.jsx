export default function CarbonScore({ scoreData, dailyAverage }) {
  if (!scoreData) {
    return (
      <div className="score-card">
        <h2>🏆 Carbon Score</h2>
        <p className="score-empty">Log activities to calculate your score</p>
      </div>
    );
  }

  const scorePercentage = scoreData.score;
  const circumference = 2 * Math.PI * 45; // radius = 45

  return (
    <div className="score-card">
      <h2>🏆 Carbon Score</h2>
      
      <div className="score-visual">
        <svg width="140" height="140" className="score-circle">
          <circle
            cx="70"
            cy="70"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <circle
            cx="70"
            cy="70"
            r="45"
            fill="none"
            stroke={scoreData.color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (scorePercentage / 100) * circumference}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
          <text
            x="70"
            y="80"
            textAnchor="middle"
            className="score-value"
            fill="#e2e8f0"
            fontSize="44"
            fontWeight="700"
          >
            {Math.round(scoreData.score)}
          </text>
        </svg>
      </div>

      <div className="score-info">
        <div className="score-label" style={{ color: scoreData.color }}>
          {scoreData.label}
        </div>
        <p className="score-description">{scoreData.description}</p>
      </div>

      <div className="score-daily">
        <span>Daily Average:</span>
        <strong>{dailyAverage?.toFixed(1) || '0'} kg CO₂e</strong>
      </div>

      <div className="score-legend">
        <div className="legend-item legend-excellent">90-100: Excellent</div>
        <div className="legend-item legend-good">70-89: Good</div>
        <div className="legend-item legend-average">50-69: Average</div>
        <div className="legend-item legend-high">30-49: High</div>
        <div className="legend-item legend-very-high">0-29: Very High</div>
      </div>
    </div>
  );
}

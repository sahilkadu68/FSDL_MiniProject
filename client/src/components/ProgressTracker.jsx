export default function ProgressTracker({ progressData }) {
  if (!progressData) {
    return (
      <div className="progress-card">
        <h2>📈 Weekly Progress</h2>
        <p className="progress-empty">Track activities to see your weekly progress</p>
      </div>
    );
  }

  const { trend, status, message, changePercent, lastWeekAvg, previousWeekAvg } = progressData;

  return (
    <div className="progress-card">
      <h2>📈 Weekly Progress</h2>

      <div className="progress-comparison">
        <div className="comparison-item">
          <div className="comparison-label">Last Week</div>
          <div className="comparison-value">{lastWeekAvg.toFixed(1)}</div>
          <div className="comparison-unit">kg/day avg</div>
        </div>

        <div className="comparison-arrow">
          <span className={`trend-indicator trend-${status}`}>{trend}</span>
        </div>

        <div className="comparison-item">
          <div className="comparison-label">Week Before</div>
          <div className="comparison-value">{previousWeekAvg.toFixed(1)}</div>
          <div className="comparison-unit">kg/day avg</div>
        </div>
      </div>

      <div className={`progress-change progress-change-${status}`}>
        <span className="change-percentage">
          {Math.abs(changePercent).toFixed(0)}%
        </span>
        <span className="change-status">
          {changePercent > 0 ? 'Increase' : changePercent < 0 ? 'Decrease' : 'No Change'}
        </span>
      </div>

      <p className="progress-message">{message}</p>

      <div className="progress-tips">
        {status === 'decreasing' && (
          <div className="progress-tip progress-tip-success">
            ✨ Great job! Keep up the progress!
          </div>
        )}
        {status === 'increasing' && (
          <div className="progress-tip progress-tip-warning">
            ⚠️ Your emissions increased. Review the Smart Suggestions!
          </div>
        )}
        {status === 'stable' && (
          <div className="progress-tip progress-tip-info">
            → Stable week. Look for opportunities to improve!
          </div>
        )}
      </div>
    </div>
  );
}

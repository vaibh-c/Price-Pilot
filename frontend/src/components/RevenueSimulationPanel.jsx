import React from 'react';

const RevenueSimulationPanel = ({ currentRevenue, suggestedRevenue, change, changePercent }) => {
  const isPositive = change >= 0;

  return (
    <div className="revenue-simulation-panel">
      <h3>Revenue Simulation</h3>
      <div className="revenue-comparison">
        <div className="revenue-card">
          <div className="revenue-label">Current Estimated Revenue</div>
          <div className="revenue-value">${currentRevenue.toFixed(2)}</div>
        </div>
        <div className="revenue-arrow">→</div>
        <div className="revenue-card">
          <div className="revenue-label">Forecasted Revenue</div>
          <div className="revenue-value">${suggestedRevenue.toFixed(2)}</div>
        </div>
        <div className="revenue-card highlight">
          <div className="revenue-label">Expected Change</div>
          <div className={`revenue-value ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}${change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(1)}%)
          </div>
        </div>
      </div>
      
      <div className="revenue-chart">
        <div className="chart-bar-container">
          <div className="chart-bar-label">Current</div>
          <div className="chart-bar-wrapper">
            <div 
              className="chart-bar current"
              style={{ width: '100%' }}
            >
              <span>${currentRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="chart-bar-container">
          <div className="chart-bar-label">Forecasted</div>
          <div className="chart-bar-wrapper">
            <div 
              className={`chart-bar ${isPositive ? 'positive' : 'negative'}`}
              style={{ 
                width: `${Math.min(100, (suggestedRevenue / currentRevenue) * 100)}%` 
              }}
            >
              <span>${suggestedRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueSimulationPanel;


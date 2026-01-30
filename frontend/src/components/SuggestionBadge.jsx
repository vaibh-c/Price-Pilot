import React from 'react';

const SuggestionBadge = ({ value, type = 'revenue' }) => {
  // Handle null, undefined, or invalid values
  if (value === null || value === undefined || isNaN(value)) {
    return <span className="suggestion-badge">N/A</span>;
  }

  const isPositive = value > 0;
  const formattedValue = isPositive ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
  
  return (
    <span className={`suggestion-badge ${isPositive ? 'positive' : 'negative'}`}>
      {formattedValue}
    </span>
  );
};

export default SuggestionBadge;


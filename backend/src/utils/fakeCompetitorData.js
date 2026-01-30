/**
 * Simulates competitor pricing data when real competitor data is not available
 */

/**
 * Generate a simulated competitor price based on current price
 * @param {number} currentPrice - The current price of the product
 * @returns {number} - Simulated competitor price
 */
export const getCompetitorPrice = (currentPrice) => {
  // Simulate competitor price as current_price ± 5-20% random variation
  const variation = (Math.random() * 0.15 + 0.05) * (Math.random() > 0.5 ? 1 : -1);
  return Math.max(0.01, currentPrice * (1 + variation));
};

/**
 * Get competitor price hint for reasoning
 * @param {number} currentPrice - The current price of the product
 * @param {number} suggestedPrice - The suggested price
 * @returns {string} - Competitor price hint message
 */
export const getCompetitorHint = (currentPrice, suggestedPrice) => {
  const competitorPrice = getCompetitorPrice(currentPrice);
  const diff = ((competitorPrice - currentPrice) / currentPrice) * 100;
  
  if (Math.abs(diff) < 2) {
    return 'Competitor price similar';
  } else if (diff > 0) {
    return `Competitor price ${diff.toFixed(1)}% higher`;
  } else {
    return `Competitor price ${Math.abs(diff).toFixed(1)}% lower`;
  }
};


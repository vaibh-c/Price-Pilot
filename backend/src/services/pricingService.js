import { getCompetitorPrice, getCompetitorHint } from '../utils/fakeCompetitorData.js';

/**
 * Calculate simple price elasticity based on sales history
 * @param {Array} salesHistory - Array of {date, units_sold, price}
 * @returns {number} - Estimated elasticity coefficient
 */
const calculateElasticity = (salesHistory) => {
  if (!salesHistory || salesHistory.length < 2) {
    return -1.5; // Default elasticity (demand decreases as price increases)
  }

  // Sort by date
  const sorted = [...salesHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Use recent data (last 10 data points)
  const recent = sorted.slice(-10);
  
  if (recent.length < 2) {
    return -1.5;
  }

  // Calculate average price and units sold
  const avgPrice = recent.reduce((sum, s) => sum + s.price, 0) / recent.length;
  const avgUnits = recent.reduce((sum, s) => sum + s.units_sold, 0) / recent.length;

  // Simple elasticity approximation: % change in quantity / % change in price
  let totalElasticity = 0;
  let count = 0;

  for (let i = 1; i < recent.length; i++) {
    const priceChange = (recent[i].price - recent[i-1].price) / recent[i-1].price;
    const quantityChange = (recent[i].units_sold - recent[i-1].units_sold) / recent[i-1].units_sold;
    
    if (Math.abs(priceChange) > 0.01) { // Avoid division by very small numbers
      const elasticity = quantityChange / priceChange;
      if (isFinite(elasticity) && elasticity < 0) { // Only negative elasticity makes sense
        totalElasticity += elasticity;
        count++;
      }
    }
  }

  return count > 0 ? totalElasticity / count : -1.5;
};

/**
 * Calculate expected revenue change
 * @param {number} currentPrice - Current price
 * @param {number} suggestedPrice - Suggested price
 * @param {number} elasticity - Price elasticity coefficient
 * @param {number} avgUnitsSold - Average units sold per period
 * @returns {number} - Expected revenue change percentage
 */
const calculateRevenueChange = (currentPrice, suggestedPrice, elasticity, avgUnitsSold) => {
  if (!isFinite(currentPrice) || !isFinite(suggestedPrice) || !isFinite(elasticity) || !isFinite(avgUnitsSold)) {
    return 0;
  }
  
  const priceChange = (suggestedPrice - currentPrice) / currentPrice;
  const quantityChange = elasticity * priceChange;
  
  const currentRevenue = currentPrice * avgUnitsSold;
  const newQuantity = Math.max(0, avgUnitsSold * (1 + quantityChange)); // Ensure non-negative
  const newRevenue = suggestedPrice * newQuantity;
  
  // Avoid division by zero
  if (currentRevenue === 0) {
    return newRevenue > 0 ? 100 : 0;
  }
  
  return ((newRevenue - currentRevenue) / currentRevenue) * 100;
};

/**
 * Calculate expected margin change
 * @param {number} cost - Product cost
 * @param {number} currentPrice - Current price
 * @param {number} suggestedPrice - Suggested price
 * @param {number} elasticity - Price elasticity coefficient
 * @param {number} avgUnitsSold - Average units sold per period
 * @returns {number} - Expected margin change percentage
 */
const calculateMarginChange = (cost, currentPrice, suggestedPrice, elasticity, avgUnitsSold) => {
  if (!isFinite(cost) || !isFinite(currentPrice) || !isFinite(suggestedPrice) || !isFinite(elasticity) || !isFinite(avgUnitsSold)) {
    return 0;
  }
  
  const priceChange = (suggestedPrice - currentPrice) / currentPrice;
  const quantityChange = elasticity * priceChange;
  
  const currentMargin = (currentPrice - cost) * avgUnitsSold;
  const newQuantity = Math.max(0, avgUnitsSold * (1 + quantityChange)); // Ensure non-negative
  const newMargin = (suggestedPrice - cost) * newQuantity;
  
  // Avoid division by zero
  if (currentMargin === 0) {
    return newMargin > 0 ? 100 : 0;
  }
  
  return ((newMargin - currentMargin) / currentMargin) * 100;
};

/**
 * Get average units sold from sales history
 * @param {Array} salesHistory - Array of sales records
 * @returns {number} - Average units sold per period
 */
const getAverageUnitsSold = (salesHistory) => {
  if (!salesHistory || salesHistory.length === 0) {
    return 10; // Default assumption
  }
  
  const total = salesHistory.reduce((sum, s) => sum + s.units_sold, 0);
  return total / salesHistory.length;
};

/**
 * Main pricing optimization function
 * @param {Object} product - Product object with all fields
 * @returns {Object} - Pricing suggestion with reason
 */
export const optimizePrice = (product) => {
  const {
    current_price,
    cost,
    inventory,
    sales_history
  } = product;

  // Calculate metrics
  const elasticity = calculateElasticity(sales_history);
  const avgUnitsSold = getAverageUnitsSold(sales_history);
  const inventoryRatio = inventory / Math.max(avgUnitsSold * 30, 1); // Days of inventory
  const recentDemand = sales_history.length > 0 
    ? sales_history.slice(-7).reduce((sum, s) => sum + s.units_sold, 0) / 7
    : avgUnitsSold;

  let suggestedPrice = current_price;
  let reason = '';
  let adjustmentFactor = 0;

  // Rule 1: Low inventory + High demand → Increase price
  if (inventoryRatio < 7 && recentDemand > avgUnitsSold * 1.2) {
    adjustmentFactor = 0.10; // 10% increase
    reason = 'Low inventory and high recent demand, suggested price increase to protect stock';
  }
  // Rule 2: High inventory + Low demand → Decrease price
  else if (inventoryRatio > 30 && recentDemand < avgUnitsSold * 0.8) {
    adjustmentFactor = -0.15; // 15% decrease
    reason = 'High inventory and low recent demand, suggested price decrease to boost sales';
  }
  // Rule 3: Very low inventory → Increase price significantly
  else if (inventoryRatio < 3) {
    adjustmentFactor = 0.20; // 20% increase
    reason = 'Very low inventory, increase price to protect stock';
  }
  // Rule 4: High inventory → Decrease price moderately
  else if (inventoryRatio > 60) {
    adjustmentFactor = -0.10; // 10% decrease
    reason = 'High inventory levels, suggested price decrease to clear stock';
  }
  // Rule 5: Use elasticity-based optimization
  else {
    // Try small adjustments and see which maximizes revenue
    const testAdjustments = [-0.05, -0.02, 0, 0.02, 0.05];
    let bestRevenue = -Infinity;
    let bestAdjustment = 0;

    for (const adj of testAdjustments) {
      const testPrice = current_price * (1 + adj);
      const revenueChange = calculateRevenueChange(current_price, testPrice, elasticity, avgUnitsSold);
      if (revenueChange > bestRevenue) {
        bestRevenue = revenueChange;
        bestAdjustment = adj;
      }
    }

    adjustmentFactor = bestAdjustment;
    reason = `Elasticity-based optimization suggests ${adjustmentFactor > 0 ? 'increase' : 'decrease'} to maximize revenue`;
  }

  // Apply competitor hint
  const competitorPrice = getCompetitorPrice(current_price);
  const competitorDiff = (competitorPrice - current_price) / current_price;
  
  // Adjust if competitor is significantly different
  if (Math.abs(competitorDiff) > 0.15) {
    if (competitorDiff > 0.15 && adjustmentFactor < 0.1) {
      // Competitor is much higher, we can increase more
      adjustmentFactor = Math.min(adjustmentFactor + 0.05, 0.15);
      reason += `. Competitor price ${(competitorDiff * 100).toFixed(1)}% higher`;
    } else if (competitorDiff < -0.15 && adjustmentFactor > -0.1) {
      // Competitor is much lower, we should decrease
      adjustmentFactor = Math.max(adjustmentFactor - 0.05, -0.15);
      reason += `. Competitor price ${Math.abs(competitorDiff * 100).toFixed(1)}% lower`;
    } else {
      reason += `. ${getCompetitorHint(current_price, suggestedPrice)}`;
    }
  } else {
    reason += `. ${getCompetitorHint(current_price, suggestedPrice)}`;
  }

  // Calculate suggested price
  suggestedPrice = current_price * (1 + adjustmentFactor);
  
  // Ensure price is not below cost (with minimum margin)
  const minMargin = 0.05; // 5% minimum margin
  suggestedPrice = Math.max(suggestedPrice, cost * (1 + minMargin));
  
  // Round to 2 decimal places
  suggestedPrice = Math.round(suggestedPrice * 100) / 100;

  // Calculate expected changes
  const expectedRevenueChange = calculateRevenueChange(
    current_price,
    suggestedPrice,
    elasticity,
    avgUnitsSold
  );
  
  const expectedMarginChange = calculateMarginChange(
    cost,
    current_price,
    suggestedPrice,
    elasticity,
    avgUnitsSold
  );

  // Ensure all values are valid numbers
  const safeRevenueChange = isFinite(expectedRevenueChange) ? Math.round(expectedRevenueChange * 100) / 100 : 0;
  const safeMarginChange = isFinite(expectedMarginChange) ? Math.round(expectedMarginChange * 100) / 100 : 0;

  return {
    suggested_price: isFinite(suggestedPrice) ? suggestedPrice : current_price,
    expected_revenue_change: safeRevenueChange,
    expected_margin_change: safeMarginChange,
    reason: reason.trim() || 'Price optimization applied'
  };
};


# Dynamic Pricing Assistant - Architecture & Algorithm Explanation

## 🌐 How the Website Works (Frontend Flow)

### 1. **Application Structure**

The frontend is built with React and uses a component-based architecture:

```
Dashboard (Main Page)
├── Header with Actions (Upload, Optimize buttons)
├── Revenue Simulation Panel (shows before/after revenue)
└── Product Table (lists all products with suggestions)
    └── Product Rows (individual product details + Apply button)
```

### 2. **User Flow & Data Flow**

#### **Step 1: Loading Products**
```
User opens dashboard → useEffect hook triggers
→ Calls getProducts() API
→ GET /api/products
→ Backend queries MongoDB
→ Returns product list
→ Updates React state (setProducts)
→ Renders ProductTable component
```

#### **Step 2: Uploading Products**
```
User clicks "Upload Products"
→ Opens UploadProductsModal
→ User selects CSV or enters manually
→ Calls uploadProducts() API
→ POST /api/products/upload
→ Backend validates & saves to MongoDB
→ Modal closes, products reload
→ Dashboard updates with new products
```

#### **Step 3: Running Optimization**
```
User clicks "Run Optimization"
→ handleOptimize() function called
→ Maps all product IDs
→ Calls optimizePrices({ productIds }) API
→ POST /api/optimize with product IDs
→ Backend processes each product (see algorithm below)
→ Returns suggestions for all products
→ Frontend maps suggestions by productId
→ Updates state: setSuggestions(suggestionsMap)
→ Renders suggestions in ProductTable
→ Calculates and displays Revenue Simulation
```

#### **Step 4: Viewing Revenue Simulation**
```
After optimization, calculateTotalRevenue() runs:
→ Loops through optimization results
→ For each product:
  - Calculates average units sold from sales_history
  - Current revenue = current_price × avgUnits
  - Suggested revenue = suggested_price × avgUnits × (1 + revenue_change%)
→ Sums all products
→ Displays in RevenueSimulationPanel
→ Shows: Current, Forecasted, Change (dollar & %)
```

#### **Step 5: Applying Suggestions**
```
User clicks "Apply" on a product
→ handleApplySuggestion() called
→ Calls applySuggestion(productId, suggestionId) API
→ POST /api/suggestions/apply
→ Backend:
  - Updates product.current_price = suggested_price
  - Marks suggestion as applied
  - Saves to database
→ Frontend reloads products
→ Removes suggestion from UI (already applied)
```

### 3. **State Management**

The Dashboard component uses React hooks to manage state:

- **products**: Array of all products from database
- **suggestions**: Object mapping productId → suggestion data
- **loading**: Boolean for loading states
- **optimizationResults**: Full optimization response from backend
- **showUploadModal**: Controls modal visibility

### 4. **API Communication**

All API calls go through `apiClient.js`:
- Uses Axios for HTTP requests
- Base URL: `http://localhost:5000/api`
- Handles both JSON and FormData (for CSV uploads)
- Proxy configured in `vite.config.js` for development

---

## 🧮 How the Backend Algorithm Works

### 1. **Request Flow**

```
POST /api/optimize
→ optimizeController.optimizePrices()
→ Fetches products from MongoDB
→ Loops through each product
→ Calls pricingService.optimizePrice(product)
→ Creates Suggestion record in database
→ Returns all suggestions
```

### 2. **Pricing Algorithm (Core Logic)**

The `optimizePrice()` function uses a **multi-factor decision tree**:

#### **Phase 1: Calculate Metrics**

```javascript
// 1. Price Elasticity
elasticity = calculateElasticity(sales_history)
// Measures: How much demand changes when price changes
// Formula: % change in quantity / % change in price
// Example: If price ↑ 10% and sales ↓ 15%, elasticity = -1.5

// 2. Average Units Sold
avgUnitsSold = getAverageUnitsSold(sales_history)
// Average from historical data, or default 10 if no history

// 3. Inventory Ratio (Days of Supply)
inventoryRatio = inventory / (avgUnitsSold * 30)
// How many days of inventory at current sales rate
// Example: 120 units, 4 units/day = 30 days

// 4. Recent Demand Trend
recentDemand = average of last 7 days sales
// Compares to historical average to detect trends
```

#### **Phase 2: Rule-Based Decision Tree**

The algorithm applies rules in priority order:

**Rule 1: Low Inventory + High Demand**
```
IF inventoryRatio < 7 days AND recentDemand > 120% of average
THEN increase price by 10%
REASON: "Low inventory and high recent demand, increase price to protect stock"
```

**Rule 2: High Inventory + Low Demand**
```
IF inventoryRatio > 30 days AND recentDemand < 80% of average
THEN decrease price by 15%
REASON: "High inventory and low recent demand, decrease price to boost sales"
```

**Rule 3: Very Low Inventory (Critical)**
```
IF inventoryRatio < 3 days
THEN increase price by 20%
REASON: "Very low inventory, increase price to protect stock"
```

**Rule 4: Very High Inventory**
```
IF inventoryRatio > 60 days
THEN decrease price by 10%
REASON: "High inventory levels, decrease price to clear stock"
```

**Rule 5: Elasticity-Based Optimization (Default)**
```
IF none of above rules apply
THEN test multiple price adjustments: [-5%, -2%, 0%, +2%, +5%]
FOR each adjustment:
  - Calculate expected revenue change
  - Keep the adjustment that maximizes revenue
REASON: "Elasticity-based optimization suggests increase/decrease to maximize revenue"
```

#### **Phase 3: Competitor Adjustment**

```javascript
// Simulate competitor price (or use real data if available)
competitorPrice = getCompetitorPrice(current_price)
// Generates: current_price ± 5-20% random variation

competitorDiff = (competitorPrice - current_price) / current_price

// Adjust if competitor is significantly different
IF competitorDiff > 15% (competitor much higher)
  AND current adjustment < 10%
THEN increase adjustment by 5% (we can charge more)

IF competitorDiff < -15% (competitor much lower)
  AND current adjustment > -10%
THEN decrease adjustment by 5% (we should match)
```

#### **Phase 4: Safety Checks**

```javascript
// Calculate final suggested price
suggestedPrice = current_price × (1 + adjustmentFactor)

// Ensure minimum margin (never sell below cost + 5%)
minMargin = 0.05
suggestedPrice = Math.max(suggestedPrice, cost × 1.05)

// Round to 2 decimal places
suggestedPrice = Math.round(suggestedPrice × 100) / 100
```

#### **Phase 5: Calculate Expected Impact**

```javascript
// Revenue Change
priceChange = (suggestedPrice - currentPrice) / currentPrice
quantityChange = elasticity × priceChange
newQuantity = avgUnitsSold × (1 + quantityChange)
newRevenue = suggestedPrice × newQuantity
expectedRevenueChange = ((newRevenue - currentRevenue) / currentRevenue) × 100

// Margin Change
currentMargin = (currentPrice - cost) × avgUnitsSold
newMargin = (suggestedPrice - cost) × newQuantity
expectedMarginChange = ((newMargin - currentMargin) / currentMargin) × 100
```

### 3. **Price Elasticity Calculation**

The elasticity calculation analyzes historical sales data:

```javascript
// For each pair of consecutive sales records:
priceChange = (price[i] - price[i-1]) / price[i-1]
quantityChange = (units[i] - units[i-1]) / units[i-1]

// Elasticity = how quantity responds to price
elasticity = quantityChange / priceChange

// Average all valid elasticity values
// Result: Negative number (typically -1.5 to -3.0)
// -1.5 = "For every 1% price increase, sales drop 1.5%"
```

**Example:**
- Price was $100, sold 10 units
- Price changed to $110 (+10%), sold 8 units (-20%)
- Elasticity = -20% / 10% = -2.0
- Meaning: "Very price-sensitive, demand drops quickly with price increases"

### 4. **Revenue Optimization Logic**

When using elasticity-based optimization:

```javascript
// Test different price adjustments
testAdjustments = [-5%, -2%, 0%, +2%, +5%]

FOR each adjustment:
  testPrice = currentPrice × (1 + adjustment)
  
  // Predict quantity change
  priceChange = adjustment
  quantityChange = elasticity × priceChange
  predictedQuantity = avgUnits × (1 + quantityChange)
  
  // Calculate revenue
  predictedRevenue = testPrice × predictedQuantity
  
  // Keep the best one
  IF predictedRevenue > bestRevenue:
    bestRevenue = predictedRevenue
    bestAdjustment = adjustment
```

**Example:**
- Current: $100, 10 units/day = $1,000/day
- Test -5%: $95, 11.5 units = $1,092.50/day ✅ Best
- Test +5%: $105, 9.25 units = $971.25/day
- **Result: Decrease price by 5%**

### 5. **Database Operations**

```
Optimization Request
→ Fetch products from MongoDB
→ For each product:
  → Calculate optimization
  → Create Suggestion document:
    {
      productId: ObjectId,
      previous_price: Number,
      suggested_price: Number,
      expected_revenue_change: Number (%),
      expected_margin_change: Number (%),
      reason: String,
      applied: Boolean (false)
    }
  → Save to Suggestions collection
→ Return all suggestions
```

When user applies suggestion:
```
POST /api/suggestions/apply
→ Find Suggestion by ID
→ Find Product by ID
→ Update: product.current_price = suggestion.suggested_price
→ Update: suggestion.applied = true
→ Save both to database
```

---

## 📊 Example Calculation Walkthrough

Let's trace through a real example:

### Product: "Coffee Maker Deluxe"
- **Current Price**: $89.99
- **Cost**: $45.00
- **Inventory**: 22 units
- **Sales History**: Last 30 days, average 6 units/day
- **Recent Demand**: Last 7 days, average 8 units/day

### Step 1: Calculate Metrics
```
avgUnitsSold = 6 units/day
inventoryRatio = 22 / (6 × 30) = 0.12 days (VERY LOW!)
recentDemand = 8 units/day (133% of average - HIGH!)
elasticity = -1.8 (calculated from sales history)
```

### Step 2: Apply Rules
```
Rule 3 applies: inventoryRatio < 3 days
→ adjustmentFactor = +20%
→ reason = "Very low inventory, increase price to protect stock"
```

### Step 3: Competitor Check
```
competitorPrice = $89.99 × 1.12 = $100.79 (simulated)
competitorDiff = (100.79 - 89.99) / 89.99 = +12%
→ Not significant enough to override (need >15%)
→ Keep 20% increase
```

### Step 4: Calculate Suggested Price
```
suggestedPrice = $89.99 × 1.20 = $107.99
→ Check minimum margin: $45 × 1.05 = $47.25 ✅ (above minimum)
→ Final: $107.99
```

### Step 5: Calculate Expected Impact
```
priceChange = (107.99 - 89.99) / 89.99 = +20%
quantityChange = -1.8 × 0.20 = -36% (demand drops 36%)
newQuantity = 6 × (1 - 0.36) = 3.84 units/day

currentRevenue = $89.99 × 6 = $539.94/day
newRevenue = $107.99 × 3.84 = $414.68/day
expectedRevenueChange = (414.68 - 539.94) / 539.94 = -23.2%
```

**Result**: Increase price to protect stock, but expect revenue to decrease because demand is elastic.

---

## 🔄 Complete System Flow Diagram

```
┌─────────────┐
│   Browser   │
│  (React UI) │
└──────┬──────┘
       │
       │ HTTP Requests
       ▼
┌─────────────────┐
│  Frontend API    │
│  (apiClient.js)  │
└──────┬───────────┘
       │
       │ Proxy /api/*
       ▼
┌─────────────────┐
│  Express Server  │
│   (server.js)    │
└──────┬───────────┘
       │
       ├───► /api/products ──► productController
       ├───► /api/optimize ──► optimizeController
       │                        └─► pricingService.optimizePrice()
       │                            ├─► calculateElasticity()
       │                            ├─► Rule-based decisions
       │                            ├─► Competitor simulation
       │                            └─► Revenue calculations
       └───► /api/suggestions ─► suggestionController
       
       │
       ▼
┌─────────────────┐
│    MongoDB       │
│  - Products      │
│  - Suggestions   │
└─────────────────┘
```

---

## 🎯 Key Design Decisions

1. **Hybrid Approach**: Combines rule-based (inventory/demand) with data-driven (elasticity)
2. **Safety First**: Always ensures minimum margin, never sells below cost
3. **Competitor Awareness**: Adjusts based on market positioning
4. **Historical Learning**: Uses sales history to predict future behavior
5. **Transparency**: Provides clear reasoning for each suggestion

---

## 🚀 Performance Considerations

- **Optimization**: Processes products sequentially (could be parallelized)
- **Caching**: No caching currently (could cache elasticity calculations)
- **Database**: Uses MongoDB indexes on SKU, category for fast queries
- **Frontend**: React state management keeps UI responsive

---

This architecture provides a robust, explainable pricing optimization system that balances multiple factors to maximize revenue while protecting inventory and staying competitive.


# Dynamic Pricing Assistant

A complete MERN stack web application that helps sellers optimize product pricing using AI-powered suggestions. The system analyzes inventory levels, sales history, and competitor pricing to suggest optimal prices that maximize revenue or margin.

## 🎯 Features

- **Product Management**: Upload products via CSV or manual form entry
- **AI Price Optimization**: Intelligent price suggestions based on:
  - Inventory levels
  - Sales history and demand patterns
  - Price elasticity calculations
  - Simulated competitor pricing
- **Revenue Simulation**: Visual before/after revenue comparison
- **Suggestion Management**: Apply suggestions with one click and track history
- **Dashboard**: Clean, responsive UI for managing all products and suggestions

## 🏗️ Project Structure

```
dynamic-pricing-assistant/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── models/
│   │   │   ├── Product.js
│   │   │   └── Suggestion.js
│   │   ├── routes/
│   │   │   ├── products.js
│   │   │   ├── suggestions.js
│   │   │   └── optimize.js
│   │   ├── controllers/
│   │   │   ├── productController.js
│   │   │   ├── suggestionController.js
│   │   │   └── optimizeController.js
│   │   ├── services/
│   │   │   └── pricingService.js
│   │   └── utils/
│   │       └── fakeCompetitorData.js
│   └── scripts/
│       └── seedProducts.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── api/
    │   │   └── apiClient.js
    │   ├── pages/
    │   │   └── Dashboard.jsx
    │   ├── components/
    │   │   ├── ProductTable.jsx
    │   │   ├── ProductRow.jsx
    │   │   ├── UploadProductsModal.jsx
    │   │   ├── SuggestionBadge.jsx
    │   │   └── RevenueSimulationPanel.jsx
    │   └── styles/
    │       └── main.css
    └── public/
        └── index.html
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Step 1: Clone/Download the Project

Navigate to the project directory:

```bash
cd dynamic-pricing-assistant
```

### Step 2: Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

Create a `.env` file in the `backend` directory (you can copy from `.env.example`):

```bash
# On Windows (PowerShell)
Copy-Item .env.example .env

# On Mac/Linux
cp .env.example .env
```

4. Edit the `.env` file with your MongoDB connection string:

```env
PORT=5000
MONGO_URI=mongodb://localhost:PORT/DIRECTORY
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**
- Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get your connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/dynamic-pricing`)
- Replace `MONGO_URI` in `.env` with your Atlas connection string

**For Local MongoDB:**
- Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
- Start MongoDB service:
  - Windows: MongoDB should start automatically as a service
  - Mac: `brew services start mongodb-community`
  - Linux: `sudo systemctl start mongod`

5. Start the backend server:

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

The backend should now be running on `http://localhost:5000`. You should see:
```
Server is running on port 5000
MongoDB Connected: ...
```

### Step 3: Seed Demo Data (Optional)

In a new terminal, while the backend is running, you can seed the database with sample products:

```bash
cd backend
npm run seed
```

This will create 8 sample products with sales history.

### Step 4: Frontend Setup

1. Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Configure API URL (Optional):

The frontend is configured to proxy API requests to `http://localhost:5000` by default (see `vite.config.js`). If your backend runs on a different port, you can:

- Update `vite.config.js` proxy target, OR
- Create a `.env` file in the `frontend` directory:
  ```env
  VITE_API_BASE_URL=http://localhost:5000/api
  ```

4. Start the frontend development server:

```bash
npm run dev
```

The frontend should now be running on `http://localhost:3000` (or the port shown in the terminal).

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the Dynamic Pricing Assistant dashboard.

## 📖 Usage Guide

### 1. Upload Products

**Option A: CSV Upload**
- Click "Upload Products" button
- Select "CSV Upload" tab
- Prepare a CSV file with columns: `name`, `sku`, `category`, `cost`, `current_price`, `inventory`
- Example CSV:
  ```csv
  name,sku,category,cost,current_price,inventory
  Wireless Headphones,WH-001,Electronics,25.00,49.99,15
  Smart Watch,SW-002,Electronics,80.00,149.99,45
  ```

**Option B: Manual Entry**
- Click "Upload Products" button
- Select "Manual Entry" tab
- Fill in product details for each product
- Click "Add Another Product" to add more
- Click "Upload" when done

### 2. Run Price Optimization

1. Once products are uploaded, click the **"Run Optimization"** button
2. The system will analyze each product and generate price suggestions
3. Suggestions will appear in the product table with:
   - Suggested price
   - Expected revenue change (%)
   - Reasoning for the suggestion

### 3. View Revenue Simulation

After running optimization, the **Revenue Simulation Panel** will show:
- Current estimated revenue
- Forecasted revenue with suggested prices
- Expected change in dollars and percentage

### 4. Apply Suggestions

- Review the suggestions in the product table
- Click **"Apply"** button next to any product to apply the suggested price
- The product's `current_price` will be updated
- The suggestion will be marked as "Applied"

### 5. View Suggestion History

All suggestions are stored in the database. You can query them via the API:
```
GET http://localhost:5000/api/suggestions
```

## 🔌 API Endpoints

### Products

- `POST /api/products/upload` - Upload products (CSV or JSON)
- `GET /api/products` - Get all products (with optional filters: `?category=Electronics&search=watch`)
- `GET /api/products/:id` - Get single product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Optimization

- `POST /api/optimize` - Optimize prices
  ```json
  {
    "productIds": ["id1", "id2"],
    // OR
    "category": "Electronics",
    // OR
    "all": true
  }
  ```

### Suggestions

- `GET /api/suggestions` - Get all suggestions (filters: `?productId=xxx&applied=true`)
- `GET /api/suggestions/:id` - Get suggestion by ID
- `POST /api/suggestions/apply` - Apply a suggestion
  ```json
  {
    "productId": "product_id",
    "suggestionId": "suggestion_id"
  }
  ```

## 🧮 Pricing Logic

The pricing service uses a combination of:

1. **Rule-based logic:**
   - Low inventory + High demand → Increase price
   - High inventory + Low demand → Decrease price
   - Very low inventory → Significant price increase
   - High inventory → Price decrease

2. **Price elasticity calculation:**
   - Analyzes sales history to estimate demand elasticity
   - Compares units sold at different price points
   - Predicts revenue impact of price changes

3. **Competitor simulation:**
   - Simulates competitor prices when real data is unavailable
   - Adjusts suggestions based on competitor price hints

4. **Revenue optimization:**
   - Tests multiple price adjustments
   - Selects the price that maximizes expected revenue

## 🛠️ Troubleshooting

### Backend won't start

- Check if MongoDB is running: `mongosh` or check MongoDB service status
- Verify `.env` file exists and `MONGO_URI` is correct
- Check if port 5000 is already in use
- Review backend console for error messages

### Frontend can't connect to backend

- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify `vite.config.js` proxy settings
- Try accessing backend directly: `http://localhost:5000/api/health`

### MongoDB connection issues

- **Local MongoDB**: Ensure MongoDB service is running
- **MongoDB Atlas**: 
  - Check your IP is whitelisted in Atlas
  - Verify connection string includes correct password
  - Ensure database name is correct

### Products not showing

- Check browser console for errors
- Verify backend API is responding: `http://localhost:5000/api/products`
- Check MongoDB connection and database contents

## 📝 Environment Variables

### Backend (.env)

```env
PORT=5000                          # Backend server port
MONGO_URI=mongodb://localhost:27017/dynamic-pricing  # MongoDB connection string
NODE_ENV=development               # Environment (development/production)
```

### Frontend (.env) - Optional

```env
VITE_API_BASE_URL=http://localhost:5000/api  # Backend API base URL
```

## 🧪 Testing the Application

### End-to-End Test Flow

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Seed Demo Data (Optional):**
   ```bash
   cd backend
   npm run seed
   ```

4. **Test Workflow:**
   - Open `http://localhost:3000` in browser
   - Click "Upload Products"
   - Either upload a CSV or add products manually
   - Click "Run Optimization"
   - Review suggestions in the table
   - Check revenue simulation panel
   - Click "Apply" on one or more products
   - Verify prices are updated

## 🚧 Future Enhancements (Stretch Features)

- Auto-price scheduling (cron-like rules)
- Real competitor scraping integration
- Multi-seller/user authentication
- Advanced analytics dashboard
- Price change history timeline
- Bulk apply suggestions
- Export reports (PDF/CSV)

## 📄 License

This project is provided as-is for educational and development purposes.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend/frontend console logs
3. Verify all prerequisites are installed
4. Ensure MongoDB is accessible

---

**Happy Pricing! 🎯**


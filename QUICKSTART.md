# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Backend Setup (Terminal 1)

```bash
cd backend
npm install
# Create .env file (copy from .env.example and update MONGO_URI)
npm run dev
```

**Expected output:**
```
Server is running on port 5000
MongoDB Connected: ...
```

### 2. Seed Demo Data (Optional - Terminal 2)

```bash
cd backend
npm run seed
```

### 3. Frontend Setup (Terminal 3)

```bash
cd frontend
npm install
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

### 4. Open Browser

Navigate to: **http://localhost:3000**

## ✅ Verify Everything Works

1. **Backend Health Check:**
   - Open: http://localhost:5000/api/health
   - Should return: `{"status":"OK","message":"Dynamic Pricing API is running"}`

2. **Frontend:**
   - Should show the dashboard
   - Click "Upload Products" → Add a test product manually
   - Click "Run Optimization"
   - See suggestions appear in the table

## 🔧 Common Issues

**Backend won't start?**
- Check MongoDB is running
- Verify `.env` file exists in `backend/` folder
- Check port 5000 is not in use

**Frontend can't connect?**
- Ensure backend is running first
- Check browser console for errors
- Verify proxy in `vite.config.js` points to `http://localhost:5000`

**No products showing?**
- Run seed script: `cd backend && npm run seed`
- Or upload products via the UI

---

For detailed setup, see [README.md](./README.md)


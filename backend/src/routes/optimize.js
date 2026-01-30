import express from 'express';
import { optimizePrices } from '../controllers/optimizeController.js';

const router = express.Router();

// Routes
router.post('/', optimizePrices);

export default router;


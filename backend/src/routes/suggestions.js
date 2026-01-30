import express from 'express';
import {
  getSuggestions,
  applySuggestion,
  getSuggestionById
} from '../controllers/suggestionController.js';

const router = express.Router();

// Routes
router.get('/', getSuggestions);
router.get('/:id', getSuggestionById);
router.post('/apply', applySuggestion);

export default router;


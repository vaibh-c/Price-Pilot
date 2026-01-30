import express from 'express';
import multer from 'multer';
import {
  uploadProducts,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';

const router = express.Router();

// Configure multer for CSV uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes
router.post('/upload', upload.single('file'), uploadProducts);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;


import { Router } from 'express';
import { createProductController } from '../controllers/productController.js';

const router = Router();

router.post('/', createProductController);

export default router;

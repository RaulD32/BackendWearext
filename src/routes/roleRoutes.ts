import { Router } from 'express';
import { createRoleController, getRolesController } from '../controllers/roleController.js';

const router = Router();

router.post('/', createRoleController);
router.get('/', getRolesController);

export default router;

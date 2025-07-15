import { Router } from 'express';
import { createRoleController, getRolesController, deleteRoleController, updateRoleController } from '../controllers/roleController.js';

const router = Router();

router.get('/', getRolesController);
router.post('/', createRoleController);
router.put('/:id', updateRoleController);
router.delete('/:id', deleteRoleController);

export default router;



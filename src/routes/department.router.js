import express from 'express';
import { createDepartment, getAllDepartments, deleteDepartment } from '../app/controllers/department.controller.js';
import { authenticateToken, requireAdmin } from '../app/middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllDepartments);

// Admin only routes  
router.post('/', authenticateToken, requireAdmin, createDepartment);
router.delete('/:id', authenticateToken, requireAdmin, deleteDepartment);

export default router;

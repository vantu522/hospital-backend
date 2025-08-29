import express from 'express';
import ClinicRoomController from '../app/controllers/clinic-room.controller.js';

const router = express.Router();

router.post('/', ClinicRoomController.create);
router.get('/', ClinicRoomController.getAll);
router.get('/:id', ClinicRoomController.getById);
router.put('/:id', ClinicRoomController.update);
router.delete('/:id', ClinicRoomController.delete);

export default router;

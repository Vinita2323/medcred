import express from 'express';
import {
  adminGetHospitals,
  adminAddHospital,
  adminUpdateHospital,
  adminUpdateHospitalStatus,
  adminToggleHospitalFlag,
} from '../controllers/admin.hospital.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin', 'super_admin'));

router.get('/', adminGetHospitals);
router.post('/', adminAddHospital);
router.patch('/:id', adminUpdateHospital);
router.patch('/:id/status', adminUpdateHospitalStatus);
router.patch('/:id/toggle', adminToggleHospitalFlag);

export default router;

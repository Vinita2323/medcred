import express from 'express';
import { getAllHospitals } from '../controllers/hospital.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route: /api/v1/hospitals
router.get('/', protect, getAllHospitals);

export default router;

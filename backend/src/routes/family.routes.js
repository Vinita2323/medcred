import express from 'express';
import { addMember, getMembers, removeMember } from '../controllers/family.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

// Apply user auth middleware to all routes
router.use(protect);

router.get('/members', getMembers);
// upload is already configured to upload to public/uploads
// We use upload.fields to accept profilePhoto, aadhaarFront and aadhaarBack
router.post('/add', upload.fields([{ name: 'profilePhoto', maxCount: 1 }, { name: 'aadhaarFront', maxCount: 1 }, { name: 'aadhaarBack', maxCount: 1 }]), addMember);
router.delete('/:id', removeMember);

export default router;

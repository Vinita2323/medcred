import express from 'express';
import { autocompleteLocation } from '../controllers/location.controller.js';

const router = express.Router();

// GET /api/v1/location/autocomplete?input=...
router.get('/autocomplete', autocompleteLocation);

export default router;

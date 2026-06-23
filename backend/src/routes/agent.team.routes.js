import express from 'express';
const router = express.Router();
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { getAgentTeam } from '../controllers/agent.team.controller.js';

router.use(protect);
router.use(restrictTo('agent'));

router.get('/', getAgentTeam);

export default router;

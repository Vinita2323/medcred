import express from 'express';
import {
  getAllAgents,
  getAgentById,
  approveAgent,
  updateAgentStatus,
  promoteAgent,
} from '../controllers/admin.agent.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes below require: logged-in Admin
router.use(protect);
router.use(restrictTo('admin'));

// GET  /api/v1/admin/agents          → Get all agents (filter: ?status=Pending Approval)
router.get('/', getAllAgents);

// GET  /api/v1/admin/agents/:id      → Get single agent
router.get('/:id', getAgentById);

// PATCH /api/v1/admin/agents/:id/approve  → Approve + assign role
router.patch('/:id/approve', approveAgent);

// PATCH /api/v1/admin/agents/:id/status   → Reject / Block / Unblock
router.patch('/:id/status', updateAgentStatus);

// PATCH /api/v1/admin/agents/:id/promote  → Promote to higher role
router.patch('/:id/promote', promoteAgent);

export default router;

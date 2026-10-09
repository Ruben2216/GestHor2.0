import express from 'express';
import { refresh } from '../controllers/refreshController.js';
import { apiLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/refresh', apiLimiter, refresh);

export default router;
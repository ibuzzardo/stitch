import { Router, Request, Response } from 'express';

const router = Router();
const startTime = Date.now();

// GET /api/health - Health check
router.get('/', (req: Request, res: Response): void => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    status: 'ok',
    uptime
  });
});

export default router;

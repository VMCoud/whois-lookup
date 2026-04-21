import { Router, Request, Response } from 'express';
import {
  validateAdminLogin,
  adminAuth,
  destroySession,
} from '../middleware/admin';

const router = Router();

/**
 * 后台登录
 * POST /api/admin/login
 */
router.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({
      success: false,
      error: '缺少用户名或密码',
    });
    return;
  }

  const result = validateAdminLogin(username, password);

  if (!result.success) {
    res.status(401).json({
      success: false,
      error: result.error,
    });
    return;
  }

  res.json({
    success: true,
    message: '登录成功',
    token: result.token,
  });
});

/**
 * 后台登出
 * POST /api/admin/logout
 */
router.post('/api/admin/logout', adminAuth, (req: Request, res: Response) => {
  const token = (req.headers['x-admin-token'] as string) || req.query.adminToken as string;
  if (token) {
    destroySession(token);
  }

  res.json({
    success: true,
    message: '已退出登录',
  });
});

/**
 * 验证登录状态
 * GET /api/admin/check
 */
router.get('/api/admin/check', adminAuth, (_req: Request, res: Response) => {
  res.json({
    success: true,
    authenticated: true,
  });
});

export default router;

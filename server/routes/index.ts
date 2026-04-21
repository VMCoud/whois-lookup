import { Router } from 'express';
import whoisRouter from './whois';
import keysRouter from './keys';
import { apiKeyAuth } from '../middleware/auth';

const router = Router();

// 注册 WHOIS API 路由（需要认证）
router.use('/api/whois', apiKeyAuth);
router.use(whoisRouter);

// 注册 API Key 管理路由
router.use(keysRouter);

// 健康检查接口
router.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.COZE_PROJECT_ENV,
    timestamp: new Date().toISOString(),
  });
});

export default router;

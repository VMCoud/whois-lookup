import { Router, Request, Response } from 'express';
import {
  generateApiKey,
  listApiKeys,
  deleteApiKey,
  ensureDefaultApiKey,
} from '../middleware/auth';

const router = Router();

/**
 * 获取默认 API Key（首次访问时自动创建）
 * GET /api/keys/init
 */
router.get('/api/keys/init', (_req: Request, res: Response) => {
  const key = ensureDefaultApiKey();
  res.json({
    success: true,
    message: '默认 API Key 已生成',
    key,
    keyPrefix: key.substring(0, 8),
    notice: '请妥善保管此 Key，它只会显示一次',
  });
});

/**
 * 创建新的 API Key
 * POST /api/keys
 */
router.post('/api/keys', (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: '缺少 Key 名称',
    });
    return;
  }

  const { key, keyPrefix } = generateApiKey(name.trim());

  res.status(201).json({
    success: true,
    message: 'API Key 创建成功',
    data: {
      name: name.trim(),
      key,
      keyPrefix,
      notice: '请妥善保管此 Key，它只会显示一次',
    },
  });
});

/**
 * 获取所有 API Keys
 * GET /api/keys
 */
router.get('/api/keys', (_req: Request, res: Response) => {
  const keys = listApiKeys();

  res.json({
    success: true,
    data: keys,
  });
});

/**
 * 删除 API Key
 * DELETE /api/keys/:keyPrefix
 */
router.delete('/api/keys/:keyPrefix', (req: Request, res: Response) => {
  const { keyPrefix } = req.params;

  if (!keyPrefix) {
    res.status(400).json({
      success: false,
      error: '缺少 Key 前缀',
    });
    return;
  }

  const deleted = deleteApiKey(keyPrefix);

  if (!deleted) {
    res.status(404).json({
      success: false,
      error: 'API Key 不存在',
    });
    return;
  }

  res.json({
    success: true,
    message: 'API Key 已删除',
  });
});

export default router;

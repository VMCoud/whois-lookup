import { Router, Request, Response } from 'express';
import {
  generateApiKey,
  listApiKeys,
  deleteApiKey,
  renewApiKey,
  ensureDefaultApiKey,
  getKeyRemainingDays,
} from '../middleware/auth';

const router = Router();

/**
 * 获取默认 API Key（首次访问时自动创建，30天有效期）
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
    expiresInDays: 30,
  });
});

/**
 * 创建新的 API Key
 * POST /api/keys
 * Body: { "name": "My App", "expiresInDays": 30 } // expiresInDays 可选，不填则永不过期
 */
router.post('/api/keys', (req: Request, res: Response) => {
  const { name, expiresInDays } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: '缺少 Key 名称',
    });
    return;
  }

  // 验证过期天数
  let expiresDays: number | null = null;
  if (expiresInDays !== undefined) {
    if (typeof expiresInDays !== 'number' || expiresInDays < 0) {
      res.status(400).json({
        success: false,
        error: 'expiresInDays 必须是正整数或 0（永不过期）',
      });
      return;
    }
    expiresDays = expiresInDays === 0 ? null : expiresInDays;
  }

  const { key, keyPrefix, expiresAt } = generateApiKey(name.trim(), expiresDays);

  res.status(201).json({
    success: true,
    message: 'API Key 创建成功',
    data: {
      name: name.trim(),
      key,
      keyPrefix,
      expiresAt,
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

  // 添加剩余有效天数
  const keysWithRemaining = keys.map(k => ({
    ...k,
    remainingDays: getKeyRemainingDays(k),
  }));

  res.json({
    success: true,
    data: keysWithRemaining,
  });
});

/**
 * 续期 API Key
 * PUT /api/keys/:keyPrefix
 * Body: { "expiresInDays": 30 } // 30 天后过期，0 表示永不过期
 */
router.put('/api/keys/:keyPrefix', (req: Request, res: Response) => {
  const { keyPrefix } = req.params;
  const { expiresInDays } = req.body;

  if (!keyPrefix) {
    res.status(400).json({
      success: false,
      error: '缺少 Key 前缀',
    });
    return;
  }

  // 验证过期天数
  let expiresDays: number | null = null;
  if (expiresInDays !== undefined) {
    if (typeof expiresInDays !== 'number' || expiresInDays < 0) {
      res.status(400).json({
        success: false,
        error: 'expiresInDays 必须是正整数或 0（永不过期）',
      });
      return;
    }
    expiresDays = expiresInDays === 0 ? null : expiresInDays;
  }

  const result = renewApiKey(keyPrefix, expiresDays);

  if (!result.success) {
    res.status(404).json({
      success: false,
      error: 'API Key 不存在',
    });
    return;
  }

  res.json({
    success: true,
    message: 'API Key 已续期',
    data: {
      keyPrefix,
      expiresAt: result.newExpiresAt,
    },
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

import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// API Key 信息
interface ApiKeyInfo {
  key: string;
  keyPrefix: string;
  name: string;
  createdAt: string;
  expiresAt: string | null; // 过期时间，null 表示永不过期
  lastUsed: string | null;
  requestCount: number;
}

// 存储所有 API Keys
const apiKeys: Map<string, ApiKeyInfo> = new Map();

/**
 * 生成新的 API Key
 * @param name Key 名称
 * @param expiresInDays 过期天数，null 表示永不过期
 */
export function generateApiKey(name: string, expiresInDays: number | null = null): { key: string; keyPrefix: string; expiresAt: string | null } {
  const key = crypto.randomBytes(32).toString('hex');
  const keyPrefix = key.substring(0, 8);

  // 计算过期时间
  let expiresAt: string | null = null;
  if (expiresInDays !== null && expiresInDays > 0) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiresInDays);
    expiresAt = expiryDate.toISOString();
  }

  const info: ApiKeyInfo = {
    key,
    keyPrefix,
    name,
    createdAt: new Date().toISOString(),
    expiresAt,
    lastUsed: null,
    requestCount: 0,
  };

  apiKeys.set(key, info);

  return { key, keyPrefix, expiresAt };
}

/**
 * 验证 API Key
 */
export function validateApiKey(key: string): { valid: boolean; info: ApiKeyInfo | null; error?: string } {
  const info = apiKeys.get(key);

  if (!info) {
    return { valid: false, info: null, error: 'API key 不存在' };
  }

  // 检查是否过期
  if (info.expiresAt) {
    const now = new Date();
    const expiry = new Date(info.expiresAt);
    if (now > expiry) {
      return { valid: false, info, error: 'API key 已过期' };
    }
  }

  // 更新使用记录
  info.lastUsed = new Date().toISOString();
  info.requestCount++;

  return { valid: true, info };
}

/**
 * 获取所有 API Keys（不包含完整密钥）
 */
export function listApiKeys(): Array<Omit<ApiKeyInfo, 'key'>> {
  return Array.from(apiKeys.values()).map(info => ({
    keyPrefix: info.keyPrefix,
    name: info.name,
    createdAt: info.createdAt,
    expiresAt: info.expiresAt,
    lastUsed: info.lastUsed,
    requestCount: info.requestCount,
  }));
}

/**
 * 删除 API Key
 */
export function deleteApiKey(keyPrefix: string): boolean {
  for (const [key, info] of apiKeys.entries()) {
    if (info.keyPrefix === keyPrefix) {
      apiKeys.delete(key);
      return true;
    }
  }
  return false;
}

/**
 * 续期 API Key
 */
export function renewApiKey(keyPrefix: string, expiresInDays: number | null): { success: boolean; newExpiresAt: string | null } {
  for (const info of apiKeys.values()) {
    if (info.keyPrefix === keyPrefix) {
      if (expiresInDays === null) {
        // 永不过期
        info.expiresAt = null;
      } else {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiresInDays);
        info.expiresAt = expiryDate.toISOString();
      }
      return { success: true, newExpiresAt: info.expiresAt };
    }
  }
  return { success: false, newExpiresAt: null };
}

/**
 * 获取 Key 剩余有效天数
 */
export function getKeyRemainingDays(info: ApiKeyInfo): number | null {
  if (!info.expiresAt) {
    return null; // 永不过期
  }

  const now = new Date();
  const expiry = new Date(info.expiresAt);
  const diff = expiry.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return days > 0 ? days : 0;
}

/**
 * API Key 认证中间件（强制验证）
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  // 从请求头或查询参数获取 API Key
  const apiKey = (req.headers['x-api-key'] as string) || req.query.apiKey as string;

  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: 'Missing API key',
      message: '请在请求头中添加 X-API-Key 或在查询参数中添加 apiKey',
    });
    return;
  }

  const result = validateApiKey(apiKey);

  if (!result.valid) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired API key',
      message: result.error,
    });
    return;
  }

  // 将 info 附加到请求对象
  (req as Request & { apiKeyInfo?: ApiKeyInfo }).apiKeyInfo = result.info!;
  next();
}

/**
 * 可选的 API Key 认证中间件（不强制验证）
 */
export function optionalApiKeyAuth(req: Request, _res: Response, next: NextFunction): void {
  const apiKey = (req.headers['x-api-key'] as string) || req.query.apiKey as string;

  if (apiKey) {
    const result = validateApiKey(apiKey);
    if (result.valid && result.info) {
      (req as Request & { apiKeyInfo?: ApiKeyInfo }).apiKeyInfo = result.info;
    }
  }

  next();
}

/**
 * 生成默认的 API Key（如果不存在，30天有效期）
 */
export function ensureDefaultApiKey(): string {
  // 检查是否已有默认 key
  for (const info of apiKeys.values()) {
    if (info.name === 'Default Key') {
      return info.key;
    }
  }

  // 生成默认 key，30天有效期
  const { key } = generateApiKey('Default Key', 30);
  return key;
}

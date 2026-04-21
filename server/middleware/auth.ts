import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// 内存存储的 API Keys（生产环境应使用数据库）
interface ApiKeyInfo {
  key: string;
  keyPrefix: string;
  name: string;
  createdAt: string;
  lastUsed: string | null;
  requestCount: number;
}

// 存储所有 API Keys
const apiKeys: Map<string, ApiKeyInfo> = new Map();

/**
 * 生成新的 API Key
 */
export function generateApiKey(name: string): { key: string; keyPrefix: string } {
  const key = crypto.randomBytes(32).toString('hex');
  const keyPrefix = key.substring(0, 8);

  const info: ApiKeyInfo = {
    key,
    keyPrefix,
    name,
    createdAt: new Date().toISOString(),
    lastUsed: null,
    requestCount: 0,
  };

  apiKeys.set(key, info);

  return { key, keyPrefix };
}

/**
 * 验证 API Key
 */
export function validateApiKey(key: string): ApiKeyInfo | null {
  const info = apiKeys.get(key);
  if (info) {
    info.lastUsed = new Date().toISOString();
    info.requestCount++;
    return info;
  }
  return null;
}

/**
 * 获取所有 API Keys（不包含完整密钥）
 */
export function listApiKeys(): Array<Omit<ApiKeyInfo, 'key'>> {
  return Array.from(apiKeys.values()).map(info => ({
    keyPrefix: info.keyPrefix,
    name: info.name,
    createdAt: info.createdAt,
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
 * API Key 认证中间件
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

  const keyInfo = validateApiKey(apiKey);

  if (!keyInfo) {
    res.status(401).json({
      success: false,
      error: 'Invalid API key',
      message: 'API key 无效或已被删除',
    });
    return;
  }

  // 将 keyInfo 附加到请求对象
  (req as Request & { apiKeyInfo?: ApiKeyInfo }).apiKeyInfo = keyInfo;
  next();
}

/**
 * 可选的 API Key 认证中间件（不强制验证）
 */
export function optionalApiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const apiKey = (req.headers['x-api-key'] as string) || req.query.apiKey as string;

  if (apiKey) {
    const keyInfo = validateApiKey(apiKey);
    if (keyInfo) {
      (req as Request & { apiKeyInfo?: ApiKeyInfo }).apiKeyInfo = keyInfo;
    }
  }

  next();
}

/**
 * 生成默认的 API Key（如果不存在）
 */
export function ensureDefaultApiKey(): string {
  // 检查是否已有默认 key
  for (const info of apiKeys.values()) {
    if (info.name === 'Default Key') {
      return info.key;
    }
  }

  // 生成默认 key
  const { key } = generateApiKey('Default Key');
  return key;
}

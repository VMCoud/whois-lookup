import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

// 后台管理员账户配置（通过环境变量配置）
interface AdminConfig {
  username: string;
  passwordHash: string;
}

// 从环境变量读取管理员配置
function getAdminConfig(): AdminConfig | null {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPass) {
    // 默认账户（生产环境应设置环境变量）
    return {
      username: 'admin',
      passwordHash: crypto.createHash('sha256').update('admin123').digest('hex'),
    };
  }

  return {
    username: adminUser,
    passwordHash: crypto.createHash('sha256').update(adminPass).digest('hex'),
  };
}

// 会话存储（生产环境应使用 Redis 或数据库）
const sessions: Map<string, { username: string; createdAt: string }> = new Map();
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 小时

/**
 * 生成会话 Token
 */
export function createSession(username: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    username,
    createdAt: new Date().toISOString(),
  });

  // 清理过期会话
  cleanupSessions();

  return token;
}

/**
 * 验证会话 Token
 */
export function validateSession(token: string): boolean {
  const session = sessions.get(token);

  if (!session) {
    return false;
  }

  // 检查是否过期
  const createdAt = new Date(session.createdAt).getTime();
  const now = Date.now();

  if (now - createdAt > SESSION_EXPIRY) {
    sessions.delete(token);
    return false;
  }

  return true;
}

/**
 * 验证管理员登录
 */
export function validateAdminLogin(username: string, password: string): { success: boolean; token?: string; error?: string } {
  const config = getAdminConfig();

  if (!config) {
    return { success: false, error: '管理员未配置' };
  }

  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

  if (username !== config.username || passwordHash !== config.passwordHash) {
    return { success: false, error: '用户名或密码错误' };
  }

  const token = createSession(username);
  return { success: true, token };
}

/**
 * 验证管理员认证（中间件）
 */
export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const token = (req.headers['x-admin-token'] as string) || req.query.adminToken as string;

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: '请先登录',
    });
    return;
  }

  if (!validateSession(token)) {
    res.status(401).json({
      success: false,
      error: 'Session expired',
      message: '会话已过期，请重新登录',
    });
    return;
  }

  next();
}

// 清理过期会话
function cleanupSessions(): void {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    const createdAt = new Date(session.createdAt).getTime();
    if (now - createdAt > SESSION_EXPIRY) {
      sessions.delete(token);
    }
  }
}

/**
 * 销毁会话
 */
export function destroySession(token: string): void {
  sessions.delete(token);
}

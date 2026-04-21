// 网站设置存储模块

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface SiteSettings {
  // 网站基本信息
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  
  // SEO 设置
  seoTitle: string;
  seoDescription: string;
  seoAuthor: string;
  enableSeo: boolean;
  
  // 网站统计
  enableAnalytics: boolean;
  analyticsId: string;
  analyticsCode: string;
  
  // 页脚设置
  footerText: string;
  icpNumber: string;
  
  // 其他设置
  customCss: string;
  customJs: string;

  // 后台设置
  adminUsername: string;
  adminPasswordHash: string; // 密码使用 SHA256 哈希存储
  adminPath: string; // 自定义后台路径
}

export interface AdminCredentials {
  username: string;
  password: string;
}

// 密码哈希函数
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 验证密码
export function validatePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'WHOIS Lookup',
  siteDescription: '专业的域名 WHOIS 查询服务',
  siteKeywords: 'WHOIS, 域名查询, DNS, 域名注册',
  
  seoTitle: 'WHOIS Lookup - 域名查询服务',
  seoDescription: '提供快速的域名 WHOIS 信息查询，支持全球主流域名后缀查询',
  seoAuthor: 'WHOIS Lookup',
  enableSeo: true,
  
  enableAnalytics: false,
  analyticsId: '',
  analyticsCode: '',
  
  footerText: 'Powered by php-whois',
  icpNumber: '',
  
  customCss: '',
  customJs: '',

  // 默认后台设置（可通过环境变量覆盖）
  adminUsername: 'admin',
  adminPasswordHash: hashPassword('admin123'),
  adminPath: 'admin',
};

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

function ensureDataDir(): void {
  const dataDir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// 获取管理员认证信息（环境变量优先）
export function getAdminAuth(): { username: string; passwordHash: string; adminPath: string } {
  const settings = getSettings();
  return {
    username: process.env.ADMIN_USERNAME || settings.adminUsername,
    passwordHash: process.env.ADMIN_PASSWORD ? hashPassword(process.env.ADMIN_PASSWORD) : settings.adminPasswordHash,
    adminPath: settings.adminPath || 'admin',
  };
}

// 更新管理员密码
export function updateAdminPassword(newPassword: string): void {
  saveSettings({ adminPasswordHash: hashPassword(newPassword) });
}

// 更新管理员用户名
export function updateAdminUsername(newUsername: string): void {
  saveSettings({ adminUsername: newUsername });
}

// 更新后台路径
export function updateAdminPath(newPath: string): void {
  saveSettings({ adminPath: newPath });
}

// 获取后台路径
export function getAdminPath(): string {
  return process.env.ADMIN_PATH || getSettings().adminPath || 'admin';
}

export function getSettings(): SiteSettings {
  try {
    ensureDataDir();
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('读取设置失败:', error);
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: Partial<SiteSettings>): SiteSettings {
  ensureDataDir();
  const currentSettings = getSettings();
  const newSettings = { ...currentSettings, ...settings };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2), 'utf-8');
  return newSettings;
}

export function resetSettings(): SiteSettings {
  ensureDataDir();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
  return { ...DEFAULT_SETTINGS };
}

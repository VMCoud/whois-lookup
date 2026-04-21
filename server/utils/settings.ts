// 网站设置存储模块

import fs from 'fs';
import path from 'path';

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
  
  // WHOIS 设置
  whoisServer: string;        // 自定义 WHOIS 服务器
  whoisTimeout: number;       // 查询超时时间（毫秒）
  
  // 页脚设置
  footerText: string;
  icpNumber: string;
  
  // 其他设置
  customCss: string;
  customJs: string;
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
  
  whoisServer: '',
  whoisTimeout: 15000,
  
  footerText: 'Powered by php-whois',
  icpNumber: '',
  
  customCss: '',
  customJs: '',
};

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

function ensureDataDir(): void {
  const dataDir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
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

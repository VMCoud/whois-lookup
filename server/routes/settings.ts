// 网站设置 API 路由

import { Router, Request, Response } from 'express';
import { getSettings, saveSettings, resetSettings, SiteSettings } from '../utils/settings.js';
import { adminAuth } from '../middleware/admin.js';

const router = Router();

// 获取设置（公开接口，用于前端展示）
router.get('/api/settings', (_req: Request, res: Response) => {
  try {
    const settings = getSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取设置失败',
    });
  }
});

// 获取设置详情（公开接口，仅返回前端需要的字段）
router.get('/api/settings/public', (_req: Request, res: Response) => {
  try {
    const settings = getSettings();
    // 仅返回前端展示需要的字段
    res.json({
      success: true,
      data: {
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        footerText: settings.footerText,
        enableSeo: settings.enableSeo,
        seoTitle: settings.seoTitle,
        seoDescription: settings.seoDescription,
        enableAnalytics: settings.enableAnalytics,
        analyticsCode: settings.enableAnalytics ? settings.analyticsCode : '',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取设置失败',
    });
  }
});

// 更新设置（需管理员权限）
router.put('/api/settings', adminAuth, (req: Request, res: Response) => {
  try {
    const updates: Partial<SiteSettings> = req.body;
    const settings = saveSettings(updates);
    res.json({
      success: true,
      data: settings,
      message: '设置已保存',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '保存设置失败',
    });
  }
});

// 重置设置为默认值（需管理员权限）
router.post('/api/settings/reset', adminAuth, (_req: Request, res: Response) => {
  try {
    const settings = resetSettings();
    res.json({
      success: true,
      data: settings,
      message: '设置已重置为默认值',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '重置设置失败',
    });
  }
});

export default router;

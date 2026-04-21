// 网站设置 API 路由

import { Router, Request, Response } from 'express';
import { getSettings, saveSettings, resetSettings, SiteSettings, updateAdminPassword, updateAdminUsername, updateAdminPath, getAdminPath } from '../utils/settings.js';
import { adminAuth } from '../middleware/admin.js';

const router = Router();

// 获取后台入口路径（公开接口）
router.get('/api/admin/path', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      adminPath: getAdminPath(),
    },
  });
});

// 获取设置（公开接口，用于前端展示）
router.get('/api/settings', (_req: Request, res: Response) => {
  try {
    const settings = getSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch {
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
        icpNumber: settings.icpNumber,
        enableSeo: settings.enableSeo,
        seoTitle: settings.seoTitle,
        seoDescription: settings.seoDescription,
        enableAnalytics: settings.enableAnalytics,
        analyticsCode: settings.enableAnalytics ? settings.analyticsCode : '',
      },
    });
  } catch {
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
  } catch {
    res.status(500).json({
      success: false,
      error: '保存设置失败',
    });
  }
});

// 更新管理员密码（需管理员权限）
router.put('/api/admin/password', adminAuth, (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: '请提供当前密码和新密码',
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        error: '新密码长度不能少于6位',
      });
      return;
    }

    updateAdminPassword(newPassword);
    res.json({
      success: true,
      message: '密码修改成功',
    });
  } catch {
    res.status(500).json({
      success: false,
      error: '修改密码失败',
    });
  }
});

// 更新管理员用户名（需管理员权限）
router.put('/api/admin/username', adminAuth, (req: Request, res: Response) => {
  try {
    const { newUsername } = req.body;

    if (!newUsername) {
      res.status(400).json({
        success: false,
        error: '请提供新用户名',
      });
      return;
    }

    if (newUsername.length < 3) {
      res.status(400).json({
        success: false,
        error: '用户名长度不能少于3位',
      });
      return;
    }

    updateAdminUsername(newUsername);
    res.json({
      success: true,
      message: '用户名修改成功',
    });
  } catch {
    res.status(500).json({
      success: false,
      error: '修改用户名失败',
    });
  }
});

// 更新后台入口路径（需管理员权限）
router.put('/api/admin/path', adminAuth, (req: Request, res: Response) => {
  try {
    const { adminPath } = req.body;

    if (!adminPath) {
      res.status(400).json({
        success: false,
        error: '请提供后台入口路径',
      });
      return;
    }

    // 验证路径格式（只能包含字母、数字、连字符和下划线）
    if (!/^[a-zA-Z0-9_-]+$/.test(adminPath)) {
      res.status(400).json({
        success: false,
        error: '路径只能包含字母、数字、连字符和下划线',
      });
      return;
    }

    if (adminPath.length < 2 || adminPath.length > 32) {
      res.status(400).json({
        success: false,
        error: '路径长度需在2-32个字符之间',
      });
      return;
    }

    updateAdminPath(adminPath);
    res.json({
      success: true,
      message: '后台入口路径修改成功，请使用新路径访问',
      data: { adminPath },
    });
  } catch {
    res.status(500).json({
      success: false,
      error: '修改后台入口路径失败',
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
  } catch {
    res.status(500).json({
      success: false,
      error: '重置设置失败',
    });
  }
});

export default router;

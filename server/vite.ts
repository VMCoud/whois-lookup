// ABOUTME: Vite integration for Express server
// ABOUTME: Handles dev middleware and production static file serving

import type { Application, Request, Response, NextFunction } from 'express';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import viteConfig from '../vite.config';
import { getAdminPath } from './utils/settings';

const isDev = process.env.COZE_PROJECT_ENV !== 'PROD';

/**
 * 集成 Vite 开发服务器（中间件模式）
 * API 路由需要在 Vite 之前注册，所以这里只处理非 API 请求
 */
export async function setupViteMiddleware(app: Application) {
  const vite = await createViteServer({
    ...viteConfig,
    server: {
      ...viteConfig.server,
      middlewareMode: true,
    },
    appType: 'spa',
    // plugins from vite.config.ts are already included via spread
  });

  // 使用 Vite middleware 处理非 API 请求
  app.use((req: Request, res: Response, next: NextFunction) => {
    // 跳过 API 请求，让 Express 路由处理
    if (req.url.startsWith('/api/')) {
      return next('router');
    }

    // 动态获取当前后台路径（支持运行时修改）
    const adminPath = getAdminPath();

    // 处理自定义后台路径
    if (req.url === `/${adminPath}` || req.url === `/${adminPath}.html`) {
      const adminHtmlPath = path.join(process.cwd(), 'admin.html');
      if (fs.existsSync(adminHtmlPath)) {
        return res.sendFile(adminHtmlPath);
      }
    }

    vite.middlewares(req, res, next);
  });

  console.log(`🚀 Vite dev server initialized (admin path: dynamic)`);
}

/**
 * 设置生产环境静态文件服务
 */
export function setupStaticServer(app: Application) {
  const distPath = path.resolve(process.cwd(), 'dist');
  const adminPath = getAdminPath();

  if (!fs.existsSync(distPath)) {
    console.error('❌ dist folder not found. Please run "pnpm build" first.');
    process.exit(1);
  }

  // 1. 服务静态文件（如果存在对应文件则直接返回）
  app.use(express.static(distPath));

  // 2. 多页面支持 - 处理自定义后台路径
  app.use(`/${adminPath}`, (_req: Request, res: Response) => {
    const adminHtmlPath = path.join(distPath, 'admin.html');
    if (fs.existsSync(adminHtmlPath)) {
      res.sendFile(adminHtmlPath);
    } else {
      // 如果 admin.html 不存在，返回 index.html
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });

  // 3. SPA fallback - 所有未处理的请求返回 index.html
  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  console.log(`📦 Serving static files from dist/ (admin path: /${adminPath})`);
}

/**
 * 根据环境设置 Vite
 */
export async function setupVite(app: Application) {
  if (isDev) {
    await setupViteMiddleware(app);
  } else {
    setupStaticServer(app);
  }
}

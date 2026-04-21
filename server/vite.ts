// ABOUTME: Vite integration for Express server
// ABOUTME: Handles dev middleware and production static file serving

import type { Application, Request, Response, NextFunction } from 'express';
import express from 'express';
import path from 'path';
import fs from 'fs';

const isDev = process.env.COZE_PROJECT_ENV !== 'PROD';

/**
 * 集成 Vite 开发服务器（中间件模式）
 * API 路由需要在 Vite 之前注册，所以这里只处理非 API 请求
 */
export async function setupViteMiddleware(app: Application) {
  // 动态导入 vite，只在开发环境需要
  const { createServer: createViteServer } = await import('vite');
  const viteConfig = (await import('../vite.config')).default;
  
  const vite = await createViteServer({
    ...viteConfig,
    server: {
      ...viteConfig.server,
      middlewareMode: true,
    },
    appType: 'spa',
  });

  // 使用 Vite middleware 处理非 API 请求
  app.use((req: Request, res: Response, next: NextFunction) => {
    // 跳过 API 请求，让 Express 路由处理
    if (req.url.startsWith('/api/')) {
      return next('router');
    }
    vite.middlewares(req, res, next);
  });

  console.log('🚀 Vite dev server initialized');
}

/**
 * 设置生产环境静态文件服务
 */
export function setupStaticServer(app: Application) {
  const distPath = path.resolve(process.cwd(), 'dist');

  if (!fs.existsSync(distPath)) {
    console.error('❌ dist folder not found. Please run "pnpm build" first.');
    process.exit(1);
  }

  // 1. 服务静态文件（如果存在对应文件则直接返回）
  app.use(express.static(distPath));

  // 2. 多页面支持 - 处理 /admin.html
  app.use('/admin.html', (_req: Request, res: Response) => {
    const adminPath = path.join(distPath, 'admin.html');
    if (fs.existsSync(adminPath)) {
      res.sendFile(adminPath);
    } else {
      // 如果 admin.html 不存在，返回 index.html
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });

  // 3. SPA fallback - 所有未处理的请求返回 index.html
  // 到达这里的请求说明：
  //   - 不是 API 请求（已被前面注册的路由处理）
  //   - 不是静态文件（express.static 未找到对应文件）
  //   - 不是 /admin.html（已被上面处理）
  //   - 需要返回 index.html 让前端路由处理
  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  console.log('📦 Serving static files from dist/');
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

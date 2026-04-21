// SEO 注入中间件 - 在返回 HTML 前注入动态内容

import type { Request, Response, NextFunction } from 'express';
import { getSettings } from '../utils/settings';

/**
 * HTML 模板替换函数
 */
function injectSeoToHtml(html: string, settings: ReturnType<typeof getSettings>): string {
  // 替换标题
  let result = html.replace(
    /<title>.*?<\/title>/i,
    `<title>${escapeHtml(settings.seoTitle || 'WHOIS Lookup')}</title>`
  );

  // 注入 meta 标签
  const metaTags = `
    <meta name="description" content="${escapeHtml(settings.seoDescription || settings.siteDescription || '域名 WHOIS 查询服务')}">
    <meta name="keywords" content="${escapeHtml(settings.siteKeywords || 'WHOIS, 域名查询')}">
    <meta name="author" content="${escapeHtml(settings.seoAuthor || '')}">
  `;

  // 在 </head> 前注入 meta
  result = result.replace('</head>', `${metaTags}\n  </head>`);

  // 注入自定义 CSS
  if (settings.customCss) {
    const styleTag = `<style>\n${settings.customCss}\n</style>`;
    result = result.replace('</head>', `${styleTag}\n  </head>`);
  }

  // 注入统计代码
  if (settings.enableAnalytics && settings.analyticsCode) {
    const analyticsTag = `\n${settings.analyticsCode}\n`;
    result = result.replace('</body>', `${analyticsTag}\n  </body>`);
  }

  // 注入自定义 JS
  if (settings.customJs) {
    const scriptTag = `<script>\n${settings.customJs}\n</script>`;
    result = result.replace('</body>', `${scriptTag}\n  </body>`);
  }

  // 注入页脚设置到 window 对象，供前端使用
  const siteConfig = {
    footerText: settings.footerText,
    icpNumber: settings.icpNumber,
    siteName: settings.siteName,
  };
  const configTag = `<script>window.__SITE_CONFIG__ = ${JSON.stringify(siteConfig)};</script>`;
  
  // 尝试注入到 </body> 或 </html> 之前
  if (result.includes('</body>')) {
    result = result.replace('</body>', `${configTag}\n</body>`);
  } else if (result.includes('</html>')) {
    result = result.replace('</html>', `${configTag}\n</html>`);
  } else {
    result = result + '\n' + configTag;
  }

  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * SEO 中间件 - 处理首页和文档页的 SEO 注入
 */
export function seoMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 只处理 HTML 页面请求
  const path = req.path;
  if (!path.endsWith('.html') && path !== '/') {
    return next();
  }

  const originalSend = res.send.bind(res);

  res.send = function (body: string | Buffer | object): Response {
    // 只对 HTML 响应进行处理
    const bodyStr = typeof body === 'string' ? body : Buffer.isBuffer(body) ? body.toString() : JSON.stringify(body);
    if (bodyStr.includes('<!DOCTYPE') || bodyStr.includes('<html')) {
      const settings = getSettings();
      body = injectSeoToHtml(bodyStr, settings);
    }
    return originalSend(body);
  };

  next();
}

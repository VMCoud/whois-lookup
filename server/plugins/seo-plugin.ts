/**
 * Vite 插件 - 服务端注入 SEO 配置
 * 在开发模式下，向 HTML 注入 __SITE_CONFIG__ 和 meta 标签
 */

import type { Plugin } from 'vite';
import { getSettings } from '../utils/settings';

interface SiteConfig {
  footerText: string;
  icpNumber: string;
  siteName: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

export function seoPlugin(): Plugin {
  return {
    name: 'vite-plugin-seo-inject',
    enforce: 'pre',

    transformIndexHtml(html: string) {
      // 防止重复注入：如果已经包含 __SITE_CONFIG__，直接返回
      if (html.includes('window.__SITE_CONFIG__')) {
        return html;
      }

      const settings = getSettings();
      
      const siteConfig: SiteConfig = {
        footerText: settings.footerText || '',
        icpNumber: settings.icpNumber || '',
        siteName: settings.siteName || 'WHOIS Lookup',
        seoTitle: settings.seoTitle || 'WHOIS Lookup',
        seoDescription: settings.seoDescription || '域名 WHOIS 查询服务',
        seoKeywords: settings.siteKeywords || 'WHOIS, 域名查询',
      };

      // 注入 __SITE_CONFIG__ 到 window 对象
      const configTag = `<script>window.__SITE_CONFIG__ = ${JSON.stringify(siteConfig)};</script>`;

      // 注入 meta 标签（不包含 title，因为已在上方替换）
      const metaTags = `
  <meta name="description" content="${escapeHtml(siteConfig.seoDescription)}">
  <meta name="keywords" content="${escapeHtml(siteConfig.seoKeywords)}">`;

      // 替换 <title> 和添加 meta
      let result = html;
      
      // 如果有自定义标题，替换它
      if (siteConfig.seoTitle) {
        result = result.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(siteConfig.seoTitle)}</title>`);
      }
      
      // 在 </head> 前添加 meta 标签
      if (result.includes('</head>')) {
        result = result.replace('</head>', `${metaTags}\n  </head>`);
      }

      // 在 </body> 或 </html> 前注入配置脚本
      if (result.includes('</body>')) {
        result = result.replace('</body>', `${configTag}\n</body>`);
      } else if (result.includes('</html>')) {
        result = result.replace('</html>', `${configTag}\n</html>`);
      } else {
        result = result + '\n' + configTag;
      }

      return result;
    },
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

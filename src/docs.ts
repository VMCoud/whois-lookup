// API 文档页面 - 移动端适配

export function initDocsApp(): void {
  const app = document.getElementById('app');

  if (!app) {
    console.error('App element not found');
    return;
  }

  app.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div class="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-base sm:text-xl font-bold text-gray-900">API 文档</h1>
              <p class="text-xs text-gray-500 hidden sm:block">接口使用说明</p>
            </div>
          </div>
          <div class="flex items-center gap-2 sm:gap-4">
            <a href="/" class="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg sm:rounded-none hover:bg-gray-100 sm:hover:bg-transparent">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              <span class="hidden sm:inline">返回首页</span>
            </a>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        <!-- 简介 -->
        <section class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-6">
          <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-3">简介</h2>
          <p class="text-gray-600 text-sm sm:text-base leading-relaxed">
            WHOIS Lookup API 提供域名 WHOIS 信息查询服务，支持 API Key 认证。所有接口均基于 RESTful 风格设计，返回 JSON 格式数据。
          </p>
          <div class="mt-4 p-4 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-700">
              <strong>Base URL:</strong> <code class="bg-blue-100 px-2 py-0.5 rounded text-xs">${window.location.origin}/api</code>
            </p>
          </div>
        </section>

        <!-- 认证说明 -->
        <section class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-6">
          <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-3">认证说明</h2>
          <p class="text-gray-600 text-sm sm:text-base mb-4">
            WHOIS 查询接口需要有效的 API Key，通过以下方式传递：
          </p>
          <div class="bg-gray-50 rounded-lg p-4 font-mono text-xs sm:text-sm space-y-2">
            <p class="text-gray-600">// 方式一：请求头（推荐）</p>
            <p class="text-green-600">X-API-Key: YOUR_API_KEY</p>
            <p class="text-gray-600 mt-3">// 方式二：查询参数</p>
            <p class="text-green-600">?apiKey=YOUR_API_KEY</p>
          </div>
        </section>

        <!-- WHOIS 查询 -->
        <section class="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <div class="px-5 sm:px-6 py-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-gray-200">
            <h2 class="text-lg sm:text-xl font-bold text-gray-900">WHOIS 查询</h2>
          </div>
          <div class="p-5 sm:p-6 space-y-6">
            <!-- GET 请求 -->
            <div class="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <div class="flex items-center gap-2 mb-3">
                <span class="px-2.5 py-1 rounded text-xs font-bold bg-green-500 text-white">GET</span>
                <code class="text-sm sm:text-base text-gray-800">/api/whois</code>
              </div>
              <p class="text-gray-600 text-sm mb-4">通过域名查询 WHOIS 信息</p>
              
              <div class="space-y-3">
                <div>
                  <p class="text-sm font-medium text-gray-700 mb-1">请求参数</p>
                  <div class="overflow-x-auto">
                    <table class="w-full text-xs sm:text-sm border border-gray-200 rounded-lg">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-3 py-2 text-left text-gray-600 font-medium">参数名</th>
                          <th class="px-3 py-2 text-left text-gray-600 font-medium">类型</th>
                          <th class="px-3 py-2 text-left text-gray-600 font-medium">必填</th>
                          <th class="px-3 py-2 text-left text-gray-600 font-medium">说明</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr>
                          <td class="px-3 py-2 text-gray-800 font-mono">domain</td>
                          <td class="px-3 py-2 text-gray-600">string</td>
                          <td class="px-3 py-2"><span class="text-green-600">是</span></td>
                          <td class="px-3 py-2 text-gray-600">要查询的域名，如 google.com</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <p class="text-sm font-medium text-gray-700 mb-1">示例请求</p>
                  <div class="bg-gray-900 rounded-lg p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto">
                    <pre class="text-green-400 whitespace-pre-wrap sm:whitespace-pre">curl -X GET "${window.location.origin}/api/whois?domain=google.com" \\
  -H "X-API-Key: YOUR_API_KEY"</pre>
                  </div>
                </div>

                <div>
                  <p class="text-sm font-medium text-gray-700 mb-1">响应示例</p>
                  <div class="bg-gray-900 rounded-lg p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto">
                    <pre class="text-green-400 whitespace-pre-wrap sm:whitespace-pre">{
  "success": true,
  "domain": "google.com",
  "parsed": {
    "domain_name": "GOOGLE.COM",
    "registrar": "MarkMonitor Inc.",
    "creation_date": "1997-09-15T07:00:00+0000",
    "expiration_date": "2028-09-13T07:00:00+0000",
    "name_servers": ["NS1.GOOGLE.COM", "NS2.GOOGLE.COM"]
  },
  "queriedAt": "2024-01-15T10:30:00.000Z"
}</pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- POST 请求 -->
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="px-2.5 py-1 rounded text-xs font-bold bg-blue-500 text-white">POST</span>
                <code class="text-sm sm:text-base text-gray-800">/api/whois</code>
              </div>
              <p class="text-gray-600 text-sm mb-4">通过请求体查询，支持高级选项</p>
              
              <div class="space-y-3">
                <div>
                  <p class="text-sm font-medium text-gray-700 mb-1">请求体参数</p>
                  <div class="overflow-x-auto">
                    <table class="w-full text-xs sm:text-sm border border-gray-200 rounded-lg">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-3 py-2 text-left text-gray-600 font-medium">参数名</th>
                          <th class="px-3 py-2 text-left text-gray-600 font-medium">类型</th>
                          <th class="px-3 py-2 text-left text-gray-600 font-medium">必填</th>
                          <th class="px-3 py-2 text-left text-gray-600 font-medium">说明</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr>
                          <td class="px-3 py-2 text-gray-800 font-mono">domain</td>
                          <td class="px-3 py-2 text-gray-600">string</td>
                          <td class="px-3 py-2"><span class="text-green-600">是</span></td>
                          <td class="px-3 py-2 text-gray-600">要查询的域名</td>
                        </tr>
                        <tr>
                          <td class="px-3 py-2 text-gray-800 font-mono">server</td>
                          <td class="px-3 py-2 text-gray-600">string</td>
                          <td class="px-3 py-2"><span class="text-gray-400">否</span></td>
                          <td class="px-3 py-2 text-gray-600">指定 WHOIS 服务器</td>
                        </tr>
                        <tr>
                          <td class="px-3 py-2 text-gray-800 font-mono">follow</td>
                          <td class="px-3 py-2 text-gray-600">number</td>
                          <td class="px-3 py-2"><span class="text-gray-400">否</span></td>
                          <td class="px-3 py-2 text-gray-600">跟随重定向次数，默认 2</td>
                        </tr>
                        <tr>
                          <td class="px-3 py-2 text-gray-800 font-mono">timeout</td>
                          <td class="px-3 py-2 text-gray-600">number</td>
                          <td class="px-3 py-2"><span class="text-gray-400">否</span></td>
                          <td class="px-3 py-2 text-gray-600">超时时间(ms)，默认 10000</td>
                        </tr>
                        <tr>
                          <td class="px-3 py-2 text-gray-800 font-mono">port</td>
                          <td class="px-3 py-2 text-gray-600">number</td>
                          <td class="px-3 py-2"><span class="text-gray-400">否</span></td>
                          <td class="px-3 py-2 text-gray-600">WHOIS 端口，默认 43</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <p class="text-sm font-medium text-gray-700 mb-1">示例请求</p>
                  <div class="bg-gray-900 rounded-lg p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto">
                    <pre class="text-green-400 whitespace-pre-wrap sm:whitespace-pre">curl -X POST "${window.location.origin}/api/whois" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"domain": "google.com", "timeout": 15000}'</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- API Key 管理 -->
        <section class="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <div class="px-5 sm:px-6 py-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-gray-200">
            <h2 class="text-lg sm:text-xl font-bold text-gray-900">API Key 管理</h2>
          </div>
          <div class="p-5 sm:p-6 space-y-6">
            <!-- 初始化 Key -->
            <div class="border-b border-gray-100 pb-6">
              <div class="flex items-center gap-2 mb-3">
                <span class="px-2.5 py-1 rounded text-xs font-bold bg-green-500 text-white">GET</span>
                <code class="text-sm sm:text-base text-gray-800">/api/keys/init</code>
              </div>
              <p class="text-gray-600 text-sm mb-3">首次访问时自动创建默认 API Key（30天有效期）</p>
              
              <div>
                <p class="text-sm font-medium text-gray-700 mb-1">响应示例</p>
                <div class="bg-gray-900 rounded-lg p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto">
                  <pre class="text-green-400 whitespace-pre-wrap sm:whitespace-pre">{
  "success": true,
  "key": "64字符的hex密钥...",
  "keyPrefix": "a1b2c3d4",
  "expiresInDays": 30
}</pre>
                </div>
              </div>
            </div>

            <!-- 获取所有 Keys -->
            <div class="border-b border-gray-100 pb-6">
              <div class="flex items-center gap-2 mb-3">
                <span class="px-2.5 py-1 rounded text-xs font-bold bg-green-500 text-white">GET</span>
                <code class="text-sm sm:text-base text-gray-800">/api/keys</code>
                <span class="text-xs text-gray-500 ml-1">（需管理员 Token）</span>
              </div>
              <p class="text-gray-600 text-sm mb-3">列出所有已创建的 Keys（不包含完整密钥）</p>
              
              <div class="bg-gray-900 rounded-lg p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto">
                <pre class="text-green-400 whitespace-pre-wrap sm:whitespace-pre">curl "${window.location.origin}/api/keys" \\
  -H "X-Admin-Token: ADMIN_TOKEN"</pre>
              </div>
            </div>

            <!-- 创建 Key -->
            <div class="border-b border-gray-100 pb-6">
              <div class="flex items-center gap-2 mb-3">
                <span class="px-2.5 py-1 rounded text-xs font-bold bg-blue-500 text-white">POST</span>
                <code class="text-sm sm:text-base text-gray-800">/api/keys</code>
                <span class="text-xs text-gray-500 ml-1">（需管理员 Token）</span>
              </div>
              <p class="text-gray-600 text-sm mb-3">创建新的 API Key</p>
              
              <div class="space-y-3">
                <div>
                  <p class="text-sm font-medium text-gray-700 mb-1">请求体参数</p>
                  <div class="overflow-x-auto">
                    <table class="w-full text-xs sm:text-sm border border-gray-200 rounded-lg">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-3 py-2 text-left text-gray-600 font-medium">参数名</th>
                          <th class="px-3 py-2 text-left text-gray-600 font-medium">类型</th>
                          <th class="px-3 py-2 text-left text-gray-600 font-medium">说明</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr>
                          <td class="px-3 py-2 text-gray-800 font-mono">name</td>
                          <td class="px-3 py-2 text-gray-600">string</td>
                          <td class="px-3 py-2 text-gray-600">Key 名称</td>
                        </tr>
                        <tr>
                          <td class="px-3 py-2 text-gray-800 font-mono">expiresInDays</td>
                          <td class="px-3 py-2 text-gray-600">number</td>
                          <td class="px-3 py-2 text-gray-600">过期天数，0 表示永不过期，默认永不过期</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="bg-gray-900 rounded-lg p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto">
                  <pre class="text-green-400 whitespace-pre-wrap sm:whitespace-pre">curl -X POST "${window.location.origin}/api/keys" \\
  -H "X-Admin-Token: ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My Application", "expiresInDays": 30}'</pre>
                </div>
              </div>
            </div>

            <!-- 续期 Key -->
            <div class="border-b border-gray-100 pb-6">
              <div class="flex items-center gap-2 mb-3">
                <span class="px-2.5 py-1 rounded text-xs font-bold bg-yellow-500 text-white">PUT</span>
                <code class="text-sm sm:text-base text-gray-800">/api/keys/:keyPrefix</code>
                <span class="text-xs text-gray-500 ml-1">（需管理员 Token）</span>
              </div>
              <p class="text-gray-600 text-sm mb-3">续期指定的 API Key</p>
              
              <div class="space-y-3">
                <div>
                  <p class="text-sm font-medium text-gray-700 mb-1">请求体参数</p>
                  <div class="overflow-x-auto">
                    <table class="w-full text-xs sm:text-sm border border-gray-200 rounded-lg">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-3 py-2 text-left text-gray-600 font-medium">参数名</th>
                          <th class="px-3 py-2 text-left text-gray-600 font-medium">类型</th>
                          <th class="px-3 py-2 text-left text-gray-600 font-medium">说明</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr>
                          <td class="px-3 py-2 text-gray-800 font-mono">expiresInDays</td>
                          <td class="px-3 py-2 text-gray-600">number</td>
                          <td class="px-3 py-2 text-gray-600">续期天数，0 表示永不过期</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="bg-gray-900 rounded-lg p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto">
                  <pre class="text-green-400 whitespace-pre-wrap sm:whitespace-pre">curl -X PUT "${window.location.origin}/api/keys/a1b2c3d4" \\
  -H "X-Admin-Token: ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"expiresInDays": 30}'</pre>
                </div>
              </div>
            </div>

            <!-- 删除 Key -->
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="px-2.5 py-1 rounded text-xs font-bold bg-red-500 text-white">DELETE</span>
                <code class="text-sm sm:text-base text-gray-800">/api/keys/:keyPrefix</code>
                <span class="text-xs text-gray-500 ml-1">（需管理员 Token）</span>
              </div>
              <p class="text-gray-600 text-sm mb-3">删除指定的 API Key</p>
              
              <div class="bg-gray-900 rounded-lg p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto">
                <pre class="text-green-400 whitespace-pre-wrap sm:whitespace-pre">curl -X DELETE "${window.location.origin}/api/keys/a1b2c3d4" \\
  -H "X-Admin-Token: ADMIN_TOKEN"</pre>
              </div>
            </div>
          </div>
        </section>

        <!-- 健康检查 -->
        <section class="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <div class="px-5 sm:px-6 py-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-gray-200">
            <h2 class="text-lg sm:text-xl font-bold text-gray-900">健康检查</h2>
          </div>
          <div class="p-5 sm:p-6">
            <div class="flex items-center gap-2 mb-3">
              <span class="px-2.5 py-1 rounded text-xs font-bold bg-green-500 text-white">GET</span>
              <code class="text-sm sm:text-base text-gray-800">/api/health</code>
            </div>
            <p class="text-gray-600 text-sm mb-3">返回服务状态，无需认证</p>
            
            <div class="bg-gray-900 rounded-lg p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto">
              <pre class="text-green-400 whitespace-pre-wrap sm:whitespace-pre">{
  "success": true,
  "env": "PROD",
  "timestamp": "2024-01-15T10:30:00.000Z"
}</pre>
            </div>
          </div>
        </section>

        <!-- 错误码说明 -->
        <section class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-4">错误码说明</h2>
          <div class="overflow-x-auto">
            <table class="w-full text-xs sm:text-sm border border-gray-200 rounded-lg">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left text-gray-600 font-medium">HTTP 状态码</th>
                  <th class="px-3 py-2 text-left text-gray-600 font-medium">说明</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr>
                  <td class="px-3 py-2 text-red-600 font-mono">200</td>
                  <td class="px-3 py-2 text-gray-600">请求成功</td>
                </tr>
                <tr>
                  <td class="px-3 py-2 text-red-600 font-mono">400</td>
                  <td class="px-3 py-2 text-gray-600">请求参数错误</td>
                </tr>
                <tr>
                  <td class="px-3 py-2 text-red-600 font-mono">401</td>
                  <td class="px-3 py-2 text-gray-600">API Key 无效或已过期</td>
                </tr>
                <tr>
                  <td class="px-3 py-2 text-red-600 font-mono">403</td>
                  <td class="px-3 py-2 text-gray-600">管理员权限不足</td>
                </tr>
                <tr>
                  <td class="px-3 py-2 text-red-600 font-mono">500</td>
                  <td class="px-3 py-2 text-gray-600">服务器内部错误</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <!-- Footer -->
      <footer class="border-t border-gray-200 bg-white py-4 mt-8">
        <div id="footer-content" class="max-w-5xl mx-auto px-4 sm:px-6 text-center text-xs sm:text-sm text-gray-500">
          <p>Powered by <a href="https://github.com/netcccyun/php-whois" target="_blank" class="text-blue-600 hover:text-blue-500">php-whois</a></p>
        </div>
      </footer>
    </div>
  `;

  // 加载网站设置
  loadSiteSettings();
}

// 加载网站设置并更新页脚（使用服务端注入的配置）
interface SiteSettings {
  footerText: string;
  icpNumber: string;
  siteName?: string;
}

function loadSiteSettings(): void {
  const config = (window as { __SITE_CONFIG__?: SiteSettings }).__SITE_CONFIG__;
  
  if (config) {
    const footerContent = document.getElementById('footer-content');
    if (footerContent) {
      let html = '';
      
      // 页脚版权信息
      if (config.footerText) {
        const footerText = config.footerText;
        if (footerText.includes('[') && footerText.includes('](')) {
          html += `<p>${footerText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 hover:text-blue-500">$1</a>')}</p>`;
        } else {
          html += `<p>${escapeHtml(footerText)}</p>`;
        }
      }
      
      // 备案号
      if (config.icpNumber) {
        html += `<p class="mt-1">${escapeHtml(config.icpNumber)}</p>`;
      }
      
      if (html) {
        footerContent.innerHTML = html;
      }
    }
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initDocsApp();
});

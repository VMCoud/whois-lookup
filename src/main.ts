// WHOIS 查询 API 前端界面

interface WhoisResponse {
  success: boolean;
  domain: string;
  raw?: string;
  parsed?: Record<string, string>;
  error?: string;
  queriedAt?: string;
}

interface ApiKeyResponse {
  success: boolean;
  key?: string;
  keyPrefix?: string;
  message?: string;
  notice?: string;
  data?: Array<{
    keyPrefix: string;
    name: string;
    createdAt: string;
    lastUsed: string | null;
    requestCount: number;
  }>;
}

export function initApp(): void {
  const app = document.getElementById('app');

  if (!app) {
    console.error('App element not found');
    return;
  }

  // API Key 存储在 localStorage
  let apiKey = localStorage.getItem('whois_api_key') || '';

  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <!-- Header -->
      <header class="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold">WHOIS Lookup</h1>
              <p class="text-xs text-slate-400">域名查询服务</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <button id="api-key-btn" class="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
              <span id="api-key-status">${apiKey ? '已设置 Key' : '设置 API Key'}</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-6xl mx-auto px-6 py-12">
        <!-- API Key Modal -->
        <div id="api-key-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg">
            <div class="p-6 border-b border-slate-700">
              <h3 class="text-lg font-semibold">API Key 管理</h3>
              <p class="text-sm text-slate-400 mt-1">管理您的访问密钥</p>
            </div>
            <div class="p-6 space-y-6">
              <!-- Current Key -->
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">当前 API Key</label>
                <div class="flex gap-2">
                  <input 
                    type="password" 
                    id="current-key-input"
                    value="${apiKey}"
                    placeholder="输入或粘贴您的 API Key"
                    class="flex-1 px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button id="save-key-btn" class="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">
                    保存
                  </button>
                </div>
              </div>

              <!-- Create New Key -->
              <div class="border-t border-slate-700 pt-6">
                <h4 class="text-sm font-medium text-slate-300 mb-3">创建新 Key</h4>
                <div class="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    id="new-key-name"
                    placeholder="输入 Key 名称"
                    class="flex-1 px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button id="create-key-btn" class="px-4 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium transition-colors">
                    创建
                  </button>
                </div>
                <div id="new-key-display" class="hidden">
                  <label class="block text-xs text-slate-400 mb-2">新创建的 Key（请妥善保管，只显示一次）</label>
                  <div class="flex gap-2">
                    <input 
                      type="text" 
                      id="new-key-value"
                      readonly
                      class="flex-1 px-4 py-3 rounded-lg bg-slate-900 border border-green-500/50 text-green-400 font-mono text-sm"
                    />
                    <button id="copy-new-key-btn" class="px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors">
                      复制
                    </button>
                  </div>
                </div>
              </div>

              <!-- List Keys -->
              <div class="border-t border-slate-700 pt-6">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-sm font-medium text-slate-300">已创建的 Keys</h4>
                  <button id="refresh-keys-btn" class="text-xs text-slate-400 hover:text-white transition-colors">
                    刷新
                  </button>
                </div>
                <div id="keys-list" class="space-y-2 max-h-48 overflow-y-auto">
                  <p class="text-sm text-slate-500">加载中...</p>
                </div>
              </div>
            </div>
            <div class="p-4 border-t border-slate-700 flex justify-end">
              <button id="close-modal-btn" class="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors">
                关闭
              </button>
            </div>
          </div>
        </div>

        <!-- Search Section -->
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            域名 WHOIS 查询
          </h2>
          <p class="text-slate-400 mb-8">输入域名查看详细的注册信息和 WHOIS 数据</p>
          
          <!-- Search Form -->
          <div class="max-w-2xl mx-auto">
            <form id="whois-form" class="flex gap-3">
              <div class="flex-1 relative">
                <input 
                  type="text" 
                  id="domain-input"
                  name="domain"
                  placeholder="输入域名，例如: google.com"
                  autocomplete="off"
                  class="w-full px-5 py-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-lg"
                />
              </div>
              <button 
                type="submit"
                id="search-btn"
                class="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg id="search-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <span id="search-text">查询</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Results Section -->
        <div id="results-container" class="hidden">
          <!-- Loading State -->
          <div id="loading-state" class="hidden text-center py-12">
            <div class="inline-flex items-center gap-3 text-slate-400">
              <svg class="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>正在查询 WHOIS 信息...</span>
            </div>
          </div>

          <!-- Error State -->
          <div id="error-state" class="hidden">
            <div class="bg-red-900/30 border border-red-700/50 rounded-xl p-6 text-center">
              <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3 class="text-lg font-semibold text-red-400 mb-2">查询失败</h3>
              <p id="error-message" class="text-slate-400"></p>
            </div>
          </div>

          <!-- Success State -->
          <div id="success-state" class="hidden">
            <!-- Domain Info Card -->
            <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 mb-6 overflow-hidden">
              <div class="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-6 py-4 border-b border-slate-700/50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                    <span id="result-domain" class="text-lg font-semibold"></span>
                  </div>
                  <span id="result-time" class="text-sm text-slate-400"></span>
                </div>
              </div>
              <div class="p-6">
                <!-- Parsed Info Grid -->
                <div id="parsed-info" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"></div>
                
                <!-- Raw Data Toggle -->
                <details class="group">
                  <summary class="cursor-pointer text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                    <svg class="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                    查看原始 WHOIS 数据
                  </summary>
                  <div class="mt-4">
                    <pre id="raw-data" class="bg-slate-900/50 rounded-lg p-4 text-xs text-slate-400 overflow-x-auto max-h-96 overflow-y-auto font-mono whitespace-pre-wrap"></pre>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>

        <!-- API Docs -->
        <div class="mt-16">
          <h3 class="text-xl font-semibold mb-6 text-center">API 接口文档</h3>
          <div class="grid md:grid-cols-2 gap-6">
            <!-- GET Endpoint -->
            <div class="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="px-2 py-1 rounded text-xs font-semibold bg-green-600/20 text-green-400">GET</span>
                <code class="text-sm text-slate-300">/api/whois?domain=example.com</code>
              </div>
              <p class="text-sm text-slate-400 mb-4">通过 URL 参数查询域名（需要 API Key）</p>
              <div class="bg-slate-900/50 rounded-lg p-3 text-xs font-mono">
                <span class="text-slate-500"># 示例</span><br/>
                <span class="text-cyan-400">curl</span> <span class="text-amber-400">"https://${window.location.host}/api/whois?domain=google.com"</span><br/>
                <span class="text-blue-400">-H</span> <span class="text-amber-400">"X-API-Key: YOUR_API_KEY"</span>
              </div>
            </div>

            <!-- POST Endpoint -->
            <div class="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="px-2 py-1 rounded text-xs font-semibold bg-blue-600/20 text-blue-400">POST</span>
                <code class="text-sm text-slate-300">/api/whois</code>
              </div>
              <p class="text-sm text-slate-400 mb-4">通过请求体查询，支持高级选项</p>
              <div class="bg-slate-900/50 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                <span class="text-slate-500"># 示例</span><br/>
                <span class="text-cyan-400">curl</span> <span class="text-blue-400">-X POST</span> <span class="text-amber-400">"https://${window.location.host}/api/whois"</span><br/>
                <span class="text-blue-400">-H</span> <span class="text-amber-400">"X-API-Key: YOUR_API_KEY"</span><br/>
                <span class="text-blue-400">-H</span> <span class="text-amber-400">"Content-Type: application/json"</span><br/>
                <span class="text-blue-400">-d</span> <span class="text-green-400">'{"domain": "google.com", "timeout": 10000}'</span>
              </div>
            </div>
          </div>

          <!-- Key Management Endpoints -->
          <div class="mt-6 grid md:grid-cols-2 gap-6">
            <!-- Init Key -->
            <div class="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="px-2 py-1 rounded text-xs font-semibold bg-yellow-600/20 text-yellow-400">GET</span>
                <code class="text-sm text-slate-300">/api/keys/init</code>
              </div>
              <p class="text-sm text-slate-400">获取默认 API Key（首次使用时自动创建）</p>
            </div>

            <!-- Create Key -->
            <div class="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="px-2 py-1 rounded text-xs font-semibold bg-purple-600/20 text-purple-400">POST</span>
                <code class="text-sm text-slate-300">/api/keys</code>
              </div>
              <p class="text-sm text-slate-400">创建新的 API Key</p>
              <div class="bg-slate-900/50 rounded-lg p-3 text-xs font-mono mt-3">
                <span class="text-cyan-400">curl</span> <span class="text-blue-400">-X POST</span> <span class="text-amber-400">"https://${window.location.host}/api/keys"</span><br/>
                <span class="text-blue-400">-H</span> <span class="text-amber-400">"Content-Type: application/json"</span><br/>
                <span class="text-blue-400">-d</span> <span class="text-green-400">'{"name": "My App"}'</span>
              </div>
            </div>
          </div>

          <!-- Response Format -->
          <div class="mt-6 bg-slate-800/30 rounded-xl border border-slate-700/50 p-6">
            <h4 class="text-lg font-semibold mb-4">响应格式</h4>
            <div class="bg-slate-900/50 rounded-lg p-4 text-xs font-mono overflow-x-auto">
<pre class="text-slate-300">{
  <span class="text-green-400">"success"</span>: <span class="text-amber-400">true</span>,
  <span class="text-green-400">"domain"</span>: <span class="text-amber-400">"google.com"</span>,
  <span class="text-green-400">"raw"</span>: <span class="text-amber-400">"...原始 WHOIS 文本..."</span>,
  <span class="text-green-400">"parsed"</span>: {
    <span class="text-green-400">"domain_name"</span>: <span class="text-amber-400">"GOOGLE.COM"</span>,
    <span class="text-green-400">"registrar"</span>: <span class="text-amber-400">"MarkMonitor Inc."</span>
  },
  <span class="text-green-400">"queriedAt"</span>: <span class="text-amber-400">"2024-01-15T10:30:00.000Z"</span>
}</pre>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="border-t border-slate-700/50 mt-16">
        <div class="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-slate-500">
          <p>Powered by <a href="https://github.com/netcccyun/php-whois" target="_blank" class="text-blue-400 hover:text-blue-300">php-whois</a></p>
        </div>
      </footer>
    </div>
  `;

  // Initialize all event handlers
  initModalHandlers();
  initFormHandling();
}

function initModalHandlers(): void {
  const modal = document.getElementById('api-key-modal')!;
  const apiKeyBtn = document.getElementById('api-key-btn')!;
  const closeModalBtn = document.getElementById('close-modal-btn')!;
  const currentKeyInput = document.getElementById('current-key-input') as HTMLInputElement;
  const saveKeyBtn = document.getElementById('save-key-btn')!;
  const newKeyName = document.getElementById('new-key-name') as HTMLInputElement;
  const createKeyBtn = document.getElementById('create-key-btn')!;
  const newKeyDisplay = document.getElementById('new-key-display')!;
  const newKeyValue = document.getElementById('new-key-value') as HTMLInputElement;
  const copyNewKeyBtn = document.getElementById('copy-new-key-btn')!;
  const refreshKeysBtn = document.getElementById('refresh-keys-btn')!;
  const keysList = document.getElementById('keys-list')!;
  const apiKeyStatus = document.getElementById('api-key-status')!;

  // Open modal
  apiKeyBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    loadKeysList();
  });

  // Close modal
  closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });

  // Save current key
  saveKeyBtn.addEventListener('click', () => {
    const key = currentKeyInput.value.trim();
    if (key) {
      localStorage.setItem('whois_api_key', key);
      apiKey = key;
      apiKeyStatus.textContent = '已设置 Key';
      alert('API Key 已保存');
    }
  });

  // Create new key
  createKeyBtn.addEventListener('click', async () => {
    const name = newKeyName.value.trim();
    if (!name) {
      alert('请输入 Key 名称');
      return;
    }

    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data: ApiKeyResponse = await response.json();

      if (data.success && data.data?.key) {
        newKeyDisplay.classList.remove('hidden');
        newKeyValue.value = data.data.key;
        newKeyName.value = '';
        loadKeysList();
      } else {
        alert(data.error || '创建失败');
      }
    } catch (error) {
      alert('创建失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  });

  // Copy new key
  copyNewKeyBtn.addEventListener('click', async () => {
    const key = newKeyValue.value;
    await navigator.clipboard.writeText(key);
    alert('已复制到剪贴板');
  });

  // Refresh keys list
  refreshKeysBtn.addEventListener('click', loadKeysList);

  // Load keys list
  async function loadKeysList(): Promise<void> {
    try {
      const response = await fetch('/api/keys');
      const data: ApiKeyResponse = await response.json();

      if (data.success && data.data) {
        if (data.data.length === 0) {
          keysList.innerHTML = '<p class="text-sm text-slate-500">暂无已创建的 Keys</p>';
        } else {
          keysList.innerHTML = data.data.map(k => `
            <div class="flex items-center justify-between bg-slate-900/30 rounded-lg px-4 py-3">
              <div>
                <div class="text-sm font-medium text-white">${escapeHtml(k.name)}</div>
                <div class="text-xs text-slate-500 font-mono">${k.keyPrefix}***... | 使用 ${k.requestCount} 次</div>
              </div>
              <button class="delete-key-btn text-xs text-red-400 hover:text-red-300 transition-colors" data-key="${k.keyPrefix}">
                删除
              </button>
            </div>
          `).join('');

          // Add delete handlers
          keysList.querySelectorAll('.delete-key-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              const keyPrefix = (e.target as HTMLElement).dataset.key;
              if (!keyPrefix) return;

              if (!confirm('确定要删除这个 API Key 吗？')) return;

              try {
                const response = await fetch(`/api/keys/${keyPrefix}`, { method: 'DELETE' });
                const result = await response.json();

                if (result.success) {
                  loadKeysList();
                } else {
                  alert(result.error || '删除失败');
                }
              } catch (error) {
                alert('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
              }
            });
          });
        }
      }
    } catch (error) {
      keysList.innerHTML = '<p class="text-sm text-red-400">加载失败</p>';
    }
  }
}

function initFormHandling(): void {
  const form = document.getElementById('whois-form') as HTMLFormElement;
  const domainInput = document.getElementById('domain-input') as HTMLInputElement;
  const searchBtn = document.getElementById('search-btn') as HTMLButtonElement;
  const searchIcon = document.getElementById('search-icon') as SVGElement;
  const searchText = document.getElementById('search-text') as HTMLSpanElement;

  const resultsContainer = document.getElementById('results-container')!;
  const loadingState = document.getElementById('loading-state')!;
  const errorState = document.getElementById('error-state')!;
  const successState = document.getElementById('success-state')!;
  const errorMessage = document.getElementById('error-message')!;

  // Handle form submit
  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    const domain = domainInput.value.trim();
    if (!domain) {
      domainInput.focus();
      return;
    }

    // Check API key
    if (!apiKey) {
      alert('请先设置 API Key');
      document.getElementById('api-key-btn')?.click();
      return;
    }

    // Show loading state
    resultsContainer.classList.remove('hidden');
    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    successState.classList.add('hidden');

    // Disable button
    searchBtn.disabled = true;
    searchIcon.innerHTML = `<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>`;
    searchIcon.classList.add('animate-spin');
    searchText.textContent = '查询中...';

    try {
      const response = await fetch(`/api/whois?domain=${encodeURIComponent(domain)}`, {
        headers: {
          'X-API-Key': apiKey,
        },
      });
      const data: WhoisResponse = await response.json();

      loadingState.classList.add('hidden');

      if (!data.success) {
        errorState.classList.remove('hidden');
        errorMessage.textContent = data.error || '未知错误';

        // 如果是未授权，清除 key 并提示重新设置
        if (response.status === 401) {
          localStorage.removeItem('whois_api_key');
          apiKey = '';
          document.getElementById('api-key-status')!.textContent = '设置 API Key';
        }
      } else {
        successState.classList.remove('hidden');
        displayResults(data);
      }
    } catch (error) {
      loadingState.classList.add('hidden');
      errorState.classList.remove('hidden');
      errorMessage.textContent = error instanceof Error ? error.message : '网络请求失败';
    } finally {
      // Re-enable button
      searchBtn.disabled = false;
      searchIcon.classList.remove('animate-spin');
      searchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>`;
      searchText.textContent = '查询';
    }
  });

  // Handle Enter key
  domainInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      form.dispatchEvent(new Event('submit'));
    }
  });
}

function displayResults(data: WhoisResponse): void {
  const resultDomain = document.getElementById('result-domain')!;
  const resultTime = document.getElementById('result-time')!;
  const parsedInfo = document.getElementById('parsed-info')!;
  const rawData = document.getElementById('raw-data')!;

  // Set domain and time
  resultDomain.textContent = data.domain;
  resultTime.textContent = data.queriedAt ? new Date(data.queriedAt).toLocaleString('zh-CN') : '';

  // Display parsed info
  if (data.parsed && Object.keys(data.parsed).length > 0) {
    const importantFields = [
      { key: 'domain_name', label: '域名' },
      { key: 'domain__name', label: '域名' },
      { key: 'registrar', label: '注册商' },
      { key: 'creation_date', label: '创建日期' },
      { key: 'created_date', label: '创建日期' },
      { key: 'expiration_date', label: '过期日期' },
      { key: 'expiry_date', label: '过期日期' },
      { key: 'updated_date', label: '更新日期' },
      { key: 'modified_date', label: '修改日期' },
      { key: 'name_server', label: 'DNS 服务器' },
      { key: 'name_servers', label: 'DNS 服务器' },
      { key: 'nameserver', label: 'DNS 服务器' },
      { key: 'nameservers', label: 'DNS 服务器' },
      { key: 'status', label: '状态' },
      { key: 'domain_status', label: '域名状态' },
      { key: 'registrant', label: '注册人' },
      { key: 'registrant_organization', label: '注册组织' },
      { key: 'admin', label: '管理员' },
      { key: 'admin_name', label: '管理员姓名' },
      { key: 'tech', label: '技术联系' },
      { key: 'tech_name', label: '技术联系人' },
    ];

    let html = '';
    for (const field of importantFields) {
      const value = data.parsed[field.key];
      if (value) {
        const displayValue = Array.isArray(value) ? value.join(', ') : value;
        html += `
          <div class="bg-slate-900/30 rounded-lg p-4">
            <div class="text-xs text-slate-500 uppercase tracking-wide mb-1">${field.label}</div>
            <div class="text-white font-medium break-all">${escapeHtml(displayValue)}</div>
          </div>
        `;
      }
    }

    // Add other fields if important fields are empty
    if (!html) {
      for (const [key, value] of Object.entries(data.parsed)) {
        const displayValue = Array.isArray(value) ? value.join(', ') : value;
        html += `
          <div class="bg-slate-900/30 rounded-lg p-4">
            <div class="text-xs text-slate-500 uppercase tracking-wide mb-1">${formatKey(key)}</div>
            <div class="text-white font-medium break-all">${escapeHtml(displayValue)}</div>
          </div>
        `;
      }
    }

    parsedInfo.innerHTML = html || '<p class="text-slate-400 col-span-2 text-center">无法解析 WHOIS 数据</p>';
  } else {
    parsedInfo.innerHTML = '<p class="text-slate-400 col-span-2 text-center">无法解析 WHOIS 数据</p>';
  }

  // Display raw data
  rawData.textContent = data.raw || '无原始数据';
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

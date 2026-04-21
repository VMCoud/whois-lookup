// WHOIS 查询 API 前端界面 - 亮色主题 + 移动端适配

// API Key 存储在 localStorage
let apiKey = localStorage.getItem('whois_api_key') || '';

// ========== 类型定义 ==========

interface WhoisResponse {
  success: boolean;
  domain: string;
  raw?: string;
  parsed?: Record<string, string | string[]>;
  error?: string;
  queriedAt?: string;
  fromCache?: boolean;
}

interface SearchHistoryItem {
  domain: string;
  timestamp: number;
  success: boolean;
}

interface CacheItem {
  data: WhoisResponse;
  cachedAt: number;
  expiresAt: number;
}

// ========== 缓存配置 ==========

const CACHE_PREFIX = 'whois_cache_';
const HISTORY_KEY = 'whois_search_history';
const MAX_HISTORY_SIZE = 50;

/**
 * 计算缓存过期时间
 * 根据域名到期时间动态调整：
 * - 到期时间 < 7 天：缓存 1 小时
 * - 到期时间 < 30 天：缓存 6 小时
 * - 到期时间 < 90 天：缓存 24 小时
 * - 到期时间 >= 90 天：缓存 7 天
 * - 缓存默认最大 30 天
 */
function calculateCacheExpiry(parsed?: Record<string, string | string[]>): number {
  const now = Date.now();
  const defaultExpiry = 7 * 24 * 60 * 60 * 1000; // 7天

  if (!parsed) {
    return defaultExpiry;
  }

  // 尝试获取到期时间
  const expiryDate = parsed.expiration_date as string;
  if (expiryDate) {
    let expiryMs: number;
    try {
      // 尝试解析日期
      const expiryTime = new Date(expiryDate).getTime();
      if (isNaN(expiryTime)) {
        return defaultExpiry;
      }
      expiryMs = expiryTime - now;
    } catch {
      return defaultExpiry;
    }

    // 根据剩余时间计算缓存
    const dayMs = 24 * 60 * 60 * 1000;
    if (expiryMs < 7 * dayMs) {
      return 1 * 60 * 60 * 1000; // 1小时
    } else if (expiryMs < 30 * dayMs) {
      return 6 * 60 * 60 * 1000; // 6小时
    } else if (expiryMs < 90 * dayMs) {
      return 24 * 60 * 60 * 1000; // 1天
    }
  }

  return Math.min(defaultExpiry, 30 * 24 * 60 * 60 * 1000);
}

// ========== 缓存管理 ==========

function getCacheKey(domain: string): string {
  return CACHE_PREFIX + domain.toLowerCase().trim();
}

function getCache(domain: string): CacheItem | null {
  try {
    const cached = localStorage.getItem(getCacheKey(domain));
    if (!cached) return null;

    const item: CacheItem = JSON.parse(cached);
    if (Date.now() > item.expiresAt) {
      // 缓存已过期，删除
      localStorage.removeItem(getCacheKey(domain));
      return null;
    }
    return item;
  } catch {
    return null;
  }
}

function setCache(domain: string, data: WhoisResponse): void {
  const now = Date.now();
  const expiresAt = now + calculateCacheExpiry(data.parsed);

  const item: CacheItem = {
    data: { ...data, fromCache: true },
    cachedAt: now,
    expiresAt,
  };

  try {
    localStorage.setItem(getCacheKey(domain), JSON.stringify(item));
  } catch {
    // 存储满了，清理旧缓存
    cleanExpiredCache();
    try {
      localStorage.setItem(getCacheKey(domain), JSON.stringify(item));
    } catch {
      // 还是存不下，忽略
    }
  }
}

function cleanExpiredCache(): void {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
  for (const key of keys) {
    try {
      const item: CacheItem = JSON.parse(localStorage.getItem(key) || '{}');
      if (Date.now() > item.expiresAt) {
        localStorage.removeItem(key);
      }
    } catch {
      localStorage.removeItem(key);
    }
  }
}

// ========== 历史记录管理 ==========

function getHistory(): SearchHistoryItem[] {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

function setHistory(history: SearchHistoryItem[]): void {
  try {
    // 限制历史记录数量
    const limited = history.slice(0, MAX_HISTORY_SIZE);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
  } catch {
    // 存储满了，保留最近10条
    const limited = history.slice(0, 10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
  }
}

function addToHistory(domain: string, success: boolean): void {
  const history = getHistory();
  // 移除相同域名的旧记录
  const filtered = history.filter(h => h.domain.toLowerCase() !== domain.toLowerCase());
  // 添加新记录到开头
  filtered.unshift({ domain: domain.toLowerCase(), timestamp: Date.now(), success });
  setHistory(filtered);
}

function removeFromHistory(domain: string): void {
  const history = getHistory();
  const filtered = history.filter(h => h.domain.toLowerCase() !== domain.toLowerCase());
  setHistory(filtered);
  // 清理对应的缓存
  localStorage.removeItem(getCacheKey(domain));
  renderHistory();
}

function clearAllHistory(): void {
  const history = getHistory();
  // 清理所有缓存
  for (const item of history) {
    localStorage.removeItem(getCacheKey(item.domain));
  }
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

// ========== API Key 管理 ==========

async function initApiKey(): Promise<void> {
  if (!apiKey) {
    try {
      const keyResponse = await fetch('/api/keys/init');
      const keyData = await keyResponse.json();
      if (keyData.success && keyData.key) {
        apiKey = keyData.key;
        localStorage.setItem('whois_api_key', apiKey);
      }
    } catch (err) {
      console.error('获取 API Key 失败:', err);
    }
  }
}

// ========== UI 渲染 ==========

function renderHistory(): void {
  const historyList = document.getElementById('history-list');
  const historySection = document.getElementById('history-section');
  const historyCount = document.getElementById('history-count');

  if (!historyList || !historySection) return;

  const history = getHistory();

  if (history.length === 0) {
    historySection.classList.add('hidden');
    return;
  }

  historySection.classList.remove('hidden');
  if (historyCount) {
    historyCount.textContent = String(history.length);
  }

  historyList.innerHTML = history.map(item => {
    const date = new Date(item.timestamp);
    const timeStr = date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="history-item flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
        <div class="flex-1 min-w-0 cursor-pointer" onclick="handleHistoryClick('${escapeHtml(item.domain)}')">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 rounded-full ${item.success ? 'bg-green-500' : 'bg-red-500'}"></div>
            <span class="text-sm text-gray-800 truncate">${escapeHtml(item.domain)}</span>
          </div>
          <div class="text-xs text-gray-400 mt-0.5 ml-3.5">${timeStr}</div>
        </div>
        <button
          onclick="removeFromHistory('${escapeHtml(item.domain)}')"
          class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors ml-2 opacity-0 group-hover:opacity-100"
          title="删除"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `;
  }).join('');
}

// ========== 主应用初始化 ==========

export async function initApp(): Promise<void> {
  const app = document.getElementById('app');

  if (!app) {
    console.error('App element not found');
    return;
  }

  app.innerHTML = `
    <div class="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div class="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0 3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
              </svg>
            </div>
            <div>
              <h1 class="text-base sm:text-xl font-bold text-gray-900">WHOIS Lookup</h1>
              <p class="text-xs text-gray-500 hidden sm:block">域名查询服务</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- 清除历史按钮 -->
            <button
              id="clear-history-btn"
              onclick="clearAllHistory()"
              class="text-xs sm:text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg hover:bg-red-50"
              title="清除所有历史"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              <span class="hidden sm:inline">清除历史</span>
            </button>
            <a href="/docs.html" class="text-xs sm:text-sm text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg sm:rounded-md hover:bg-gray-100 sm:hover:bg-transparent">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span class="hidden sm:inline">API 文档</span>
            </a>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-12 w-full">
        <!-- Search Section -->
        <div class="text-center mb-6 sm:mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            域名 WHOIS 查询
          </h2>
          <p class="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8 px-2">输入域名查看详细的注册信息和 WHOIS 数据</p>

          <!-- Search Form -->
          <div class="max-w-2xl mx-auto">
            <form id="whois-form" class="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div class="flex-1 relative">
                <input
                  type="text"
                  id="domain-input"
                  name="domain"
                  placeholder="输入域名，例如: google.com"
                  autocomplete="off"
                  list="history-suggestions"
                  class="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-base sm:text-lg shadow-sm"
                />
                <datalist id="history-suggestions"></datalist>
              </div>
              <button
                type="submit"
                id="search-btn"
                class="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg id="search-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <span id="search-text">查询</span>
              </button>
            </form>
          </div>
        </div>

        <!-- History Section -->
        <div id="history-section" class="mb-6 sm:mb-8 hidden">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-gray-600 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              查询历史
              <span id="history-count" class="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">0</span>
            </h3>
          </div>
          <div id="history-list" class="space-y-2"></div>
        </div>

        <!-- Results Section -->
        <div id="results-container" class="hidden">
          <!-- Cache Notice -->
          <div id="cache-notice" class="hidden mb-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-600 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>数据来自缓存</span>
            </div>
          </div>

          <!-- Loading State -->
          <div id="loading-state" class="hidden text-center py-8 sm:py-12">
            <div class="inline-flex items-center gap-3 text-gray-500">
              <svg class="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-sm sm:text-base">正在查询 WHOIS 信息...</span>
            </div>
          </div>

          <!-- Error State -->
          <div id="error-state" class="hidden">
            <div class="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 text-center">
              <svg class="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3 class="text-base sm:text-lg font-semibold text-red-600 mb-2">查询失败</h3>
              <p id="error-message" class="text-red-500 text-sm"></p>
            </div>
          </div>

          <!-- Success State -->
          <div id="success-state" class="hidden">
            <!-- Domain Info Card -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 sm:mb-6 overflow-hidden">
              <div class="bg-gradient-to-r from-blue-600/10 to-cyan-600/10 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div class="flex items-center gap-2 sm:gap-3">
                    <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                    <span id="result-domain" class="text-base sm:text-lg font-semibold text-gray-900"></span>
                  </div>
                  <div class="flex items-center gap-3 text-xs sm:text-sm text-gray-500 text-start sm:text-end">
                    <span id="result-time"></span>
                    <span id="cache-info" class="hidden text-blue-500"></span>
                  </div>
                </div>
              </div>
              <div class="p-4 sm:p-6">
                <!-- Parsed Info Grid -->
                <div id="parsed-info" class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6"></div>

                <!-- Raw Data Toggle -->
                <details class="group">
                  <summary class="cursor-pointer text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2">
                    <svg class="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                    查看原始 WHOIS 数据
                  </summary>
                  <div class="mt-4">
                    <pre id="raw-data" class="bg-gray-100 rounded-lg p-3 sm:p-4 text-xs text-gray-600 overflow-x-auto max-h-64 sm:max-h-96 overflow-y-auto font-mono whitespace-pre-wrap break-all"></pre>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="border-t border-gray-200 bg-white py-3 sm:py-4 mt-auto">
        <div id="footer-content" class="max-w-5xl mx-auto px-4 sm:px-6 text-center text-xs sm:text-sm text-gray-500">
          <p>Powered by <a href="https://github.com/netcccyun/php-whois" target="_blank" class="text-blue-600 hover:text-blue-500">php-whois</a></p>
        </div>
      </footer>
    </div>
  `;

  // Initialize (等待 API Key 初始化完成)
  await initApiKey();
  initFormHandling();
  loadSiteSettings();
  renderHistory();
  updateDatalist();

  // 绑定全局函数
  (window as unknown as { removeFromHistory: typeof removeFromHistory; clearAllHistory: typeof clearAllHistory; handleHistoryClick: (domain: string) => void }).removeFromHistory = removeFromHistory;
  (window as unknown as { removeFromHistory: typeof removeFromHistory; clearAllHistory: typeof clearAllHistory; handleHistoryClick: (domain: string) => void }).clearAllHistory = clearAllHistory;
  (window as unknown as { removeFromHistory: typeof removeFromHistory; clearAllHistory: typeof clearAllHistory; handleHistoryClick: (domain: string) => void }).handleHistoryClick = handleHistoryClick;
}

// 点击历史记录条目
function handleHistoryClick(domain: string): void {
  const domainInput = document.getElementById('domain-input') as HTMLInputElement;
  if (domainInput) {
    domainInput.value = domain;
    domainInput.dispatchEvent(new Event('submit'));
  }
}

// 更新下拉建议列表
function updateDatalist(): void {
  const datalist = document.getElementById('history-suggestions') as HTMLDataListElement;
  if (!datalist) return;

  const history = getHistory();
  datalist.innerHTML = history.slice(0, 10).map(item =>
    `<option value="${escapeHtml(item.domain)}">`
  ).join('');
}

// ========== 表单处理 ==========

function initFormHandling(): void {
  const form = document.getElementById('whois-form') as HTMLFormElement;
  const domainInput = document.getElementById('domain-input') as HTMLInputElement;
  const searchBtn = document.getElementById('search-btn') as HTMLButtonElement;
  const searchIcon = document.getElementById('search-icon') as SVGElement;
  const searchText = document.getElementById('search-text') as HTMLSpanElement;

  const resultsContainer = document.getElementById('results-container')!;
  const cacheNotice = document.getElementById('cache-notice')!;
  const loadingState = document.getElementById('loading-state')!;
  const errorState = document.getElementById('error-state')!;
  const successState = document.getElementById('success-state')!;
  const errorMessage = document.getElementById('error-message')!;

  // 确保有 API Key
  async function ensureApiKey(): Promise<boolean> {
    if (!apiKey) {
      try {
        const keyResponse = await fetch('/api/keys/init');
        const keyData = await keyResponse.json();
        if (keyData.success && keyData.key) {
          apiKey = keyData.key;
          localStorage.setItem('whois_api_key', apiKey);
          return true;
        }
      } catch {
        console.error('获取 API Key 失败');
        return false;
      }
    }
    return !!apiKey;
  }

  // 表单提交
  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    const domain = domainInput.value.trim().toLowerCase();
    if (!domain) {
      domainInput.focus();
      return;
    }

    // 显示加载状态
    resultsContainer.classList.remove('hidden');
    cacheNotice.classList.add('hidden');
    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    successState.classList.add('hidden');

    // 禁用按钮
    searchBtn.disabled = true;
    searchIcon.innerHTML = `<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>`;
    searchIcon.classList.add('animate-spin');
    searchText.textContent = '查询中...';

    // 确保有 API Key
    const hasKey = await ensureApiKey();
    if (!hasKey) {
      loadingState.classList.add('hidden');
      errorState.classList.remove('hidden');
      errorMessage.textContent = '获取 API Key 失败，请刷新页面重试';
      searchBtn.disabled = false;
      searchText.textContent = '查询';
      return;
    }

    // 检查缓存
    const cached = getCache(domain);
    if (cached) {
      loadingState.classList.add('hidden');
      successState.classList.remove('hidden');
      cacheNotice.classList.remove('hidden');
      displayResults(cached.data, cached.cachedAt, cached.expiresAt);
      searchBtn.disabled = false;
      searchIcon.classList.remove('animate-spin');
      searchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>`;
      searchText.textContent = '查询';
      return;
    }

    try {
      const response = await fetch(`/api/whois?domain=${encodeURIComponent(domain)}`, {
        headers: { 'X-API-Key': apiKey },
      });
      const data: WhoisResponse = await response.json();

      loadingState.classList.add('hidden');

      if (!data.success) {
        errorState.classList.remove('hidden');
        errorMessage.textContent = data.error || '未知错误';
        addToHistory(domain, false);

        if (response.status === 401) {
          localStorage.removeItem('whois_api_key');
          apiKey = '';
        }
      } else {
        successState.classList.remove('hidden');
        displayResults(data);
        addToHistory(domain, true);
        // 保存到缓存
        setCache(domain, data);
      }
    } catch (error) {
      loadingState.classList.add('hidden');
      errorState.classList.remove('hidden');
      errorMessage.textContent = error instanceof Error ? error.message : '网络请求失败';
      addToHistory(domain, false);
    } finally {
      searchBtn.disabled = false;
      searchIcon.classList.remove('animate-spin');
      searchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>`;
      searchText.textContent = '查询';
      updateDatalist();
      renderHistory();
    }
  });

  // 回车键支持
  domainInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      form.dispatchEvent(new Event('submit'));
    }
  });
}

// ========== 结果展示 ==========

function displayResults(data: WhoisResponse, cachedAt?: number, expiresAt?: number): void {
  const resultDomain = document.getElementById('result-domain')!;
  const resultTime = document.getElementById('result-time')!;
  const cacheInfo = document.getElementById('cache-info')!;
  const parsedInfo = document.getElementById('parsed-info')!;
  const rawData = document.getElementById('raw-data')!;

  resultDomain.textContent = data.domain;

  // 显示查询时间
  if (data.queriedAt) {
    resultTime.textContent = new Date(data.queriedAt).toLocaleString('zh-CN');
  } else {
    resultTime.textContent = '';
  }

  // 显示缓存信息
  if (data.fromCache && cachedAt && expiresAt) {
    cacheInfo.classList.remove('hidden');
    const remainingMs = expiresAt - Date.now();
    const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000));
    const remainingMins = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
    if (remainingHours > 0) {
      cacheInfo.textContent = `缓存剩余 ${remainingHours}小时${remainingMins > 0 ? remainingMins + '分钟' : ''}`;
    } else {
      cacheInfo.textContent = `缓存剩余 ${remainingMins}分钟`;
    }
  } else {
    cacheInfo.classList.add('hidden');
  }

  if (data.parsed && Object.keys(data.parsed).length > 0) {
    const parsed = data.parsed;
    let html = '';

    // 域名基础信息
    html += `<div class="col-span-1 sm:col-span-2 mb-2"><h3 class="text-xs sm:text-sm font-semibold text-blue-600 border-b border-gray-200 pb-1">域名基础信息</h3></div>`;

    const basicFields: Array<[string, string, string?]> = [
      ['domain_name', '域名', 'domain__name'],
      ['registry_domain_id', '注册局 ID'],
      ['registrar_whois_server', 'WHOIS 服务器'],
      ['registrar_url', '注册商官网'],
      ['creation_date', '创建时间', 'created_date'],
      ['expiration_date', '到期时间', 'expiry_date', 'registry_expiry_date'],
      ['updated_date', '更新时间', 'last_updated', 'modified_date'],
    ];

    for (const [key, label, ...altKeys] of basicFields) {
      const value = (parsed[key] as string) || (altKeys.length > 0 ? (parsed[altKeys[0]] as string) : null);
      if (value) {
        html += createFieldCard(label, formatValue(value));
      }
    }

    // 注册商信息
    html += `<div class="col-span-1 sm:col-span-2 mb-2 mt-4"><h3 class="text-xs sm:text-sm font-semibold text-purple-600 border-b border-gray-200 pb-1">注册商信息</h3></div>`;

    const registrarFields: Array<[string, string]> = [
      ['registrar', '注册商'],
      ['registrar_iana_id', 'IANA 编号'],
      ['registrar_abuse_contact_email', '滥用投诉邮箱'],
      ['registrar_abuse_contact_phone', '滥用投诉电话'],
    ];

    for (const [key, label] of registrarFields) {
      const value = parsed[key];
      if (value) {
        html += createFieldCard(label, formatValue(Array.isArray(value) ? value.join(', ') : value));
      }
    }

    // 域名状态
    const statusKeys = ['domain_status', 'status'];
    const statuses: string[] = [];
    for (const key of statusKeys) {
      const value = parsed[key];
      if (value) {
        if (Array.isArray(value)) {
          statuses.push(...value);
        } else {
          statuses.push(value);
        }
      }
    }

    if (statuses.length > 0) {
      html += `<div class="col-span-1 sm:col-span-2 mb-2 mt-4"><h3 class="text-xs sm:text-sm font-semibold text-amber-600 border-b border-gray-200 pb-1">域名状态（${statuses.length}项安全锁定）</h3></div>`;
      for (const status of statuses) {
        const statusClass = status.includes('Prohibited') ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200';
        const statusText = status.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-600 hover:text-blue-500">查看详情</a>');
        html += `
          <div class="col-span-1 sm:col-span-2 ${statusClass} border rounded-lg p-3">
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-1">锁定状态</div>
            <div class="text-sm text-gray-800 break-all">${statusText}</div>
          </div>
        `;
      }
    }

    // DNS 服务器
    const nsKeys = ['name_server', 'name_servers', 'nameserver', 'nameservers', 'nserver'];
    const nameServers: string[] = [];
    for (const key of nsKeys) {
      const value = parsed[key];
      if (value) {
        if (Array.isArray(value)) {
          nameServers.push(...value);
        } else {
          nameServers.push(value);
        }
      }
    }

    if (nameServers.length > 0) {
      html += `<div class="col-span-1 sm:col-span-2 mb-2 mt-4"><h3 class="text-xs sm:text-sm font-semibold text-green-600 border-b border-gray-200 pb-1">DNS 服务器（${nameServers.length}台）</h3></div>`;
      for (const ns of nameServers) {
        html += `
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div class="text-gray-800 font-medium text-sm break-all">${escapeHtml(ns.toUpperCase())}</div>
          </div>
        `;
      }
    }

    // DNS 安全
    const dnssecKeys = ['dnssec', 'ds_dadata'];
    let dnssecValue: string | null = null;
    for (const key of dnssecKeys) {
      if (parsed[key]) {
        dnssecValue = Array.isArray(parsed[key]) ? parsed[key].join(', ') : (parsed[key] as string);
        break;
      }
    }

    if (dnssecValue) {
      html += `<div class="col-span-1 sm:col-span-2 mb-2 mt-4"><h3 class="text-xs sm:text-sm font-semibold text-indigo-600 border-b border-gray-200 pb-1">DNS 安全</h3></div>`;
      const dnssecClass = dnssecValue.toLowerCase().includes('signed') ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200';
      const dnssecText = dnssecValue.toLowerCase().includes('signed') ? 'DNSSEC 已开启（已签名）' : 'DNSSEC 未开启（未签名）';
      html += `
        <div class="col-span-1 sm:col-span-2 ${dnssecClass} border rounded-lg p-3">
          <div class="text-xs text-gray-500 uppercase tracking-wide mb-1">DNSSEC 状态</div>
          <div class="text-gray-800 text-sm">${dnssecText}</div>
        </div>
      `;
    }

    // 持有人信息
    const registrantFields: Array<[string, string]> = [
      ['registrant_name', '注册人姓名'],
      ['registrant_organization', '注册组织'],
      ['registrant_country', '注册国家'],
      ['registrant_email', '注册人邮箱'],
    ];

    const hasRegistrant = registrantFields.some(([key]) => parsed[key]);
    if (hasRegistrant) {
      html += `<div class="col-span-1 sm:col-span-2 mb-2 mt-4"><h3 class="text-xs sm:text-sm font-semibold text-pink-600 border-b border-gray-200 pb-1">持有人信息</h3></div>`;
      for (const [key, label] of registrantFields) {
        const value = parsed[key];
        if (value) {
          html += createFieldCard(label, formatValue(Array.isArray(value) ? value.join(', ') : value));
        }
      }
    }

    parsedInfo.innerHTML = html || '<p class="text-gray-500 col-span-1 sm:col-span-2 text-center text-sm">无法解析 WHOIS 数据</p>';
  } else {
    parsedInfo.innerHTML = '<p class="text-gray-500 col-span-1 sm:col-span-2 text-center text-sm">无法解析 WHOIS 数据</p>';
  }

  rawData.textContent = data.raw || '无原始数据';
}

function createFieldCard(label: string, value: string): string {
  return `
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <div class="text-xs text-gray-500 uppercase tracking-wide mb-1">${label}</div>
      <div class="text-gray-800 text-sm break-all">${value}</div>
    </div>
  `;
}

function formatValue(value: string): string {
  return value.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-600 hover:text-blue-500">$1</a>');
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ========== 网站设置 ==========

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

      if (config.footerText) {
        const footerText = config.footerText;
        if (footerText.includes('[') && footerText.includes('](')) {
          html += `<p>${footerText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 hover:text-blue-500">$1</a>')}</p>`;
        } else {
          html += `<p>${escapeHtml(footerText)}</p>`;
        }
      } else {
        html += `<p>Powered by <a href="https://github.com/netcccyun/php-whois" target="_blank" class="text-blue-600 hover:text-blue-500">php-whois</a></p>`;
      }

      if (config.icpNumber) {
        html += `<p class="mt-1">${escapeHtml(config.icpNumber)}</p>`;
      }

      footerContent.innerHTML = html;
    }
  }
}

// ========== 初始化 ==========

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

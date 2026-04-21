// WHOIS 查询 API 前端界面 - 亮色主题 + 移动端适配 + 多语言

import { initI18n, t, getLocale } from './i18n';

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
 */
function calculateCacheExpiry(parsed?: Record<string, string | string[]>): number {
  const now = Date.now();
  const defaultExpiry = 7 * 24 * 60 * 60 * 1000;

  if (!parsed) {
    return defaultExpiry;
  }

  const expiryDate = parsed.expiration_date as string;
  if (expiryDate) {
    try {
      const expiryTime = new Date(expiryDate).getTime();
      if (isNaN(expiryTime)) {
        return defaultExpiry;
      }
      const expiryMs = expiryTime - now;
      const dayMs = 24 * 60 * 60 * 1000;
      if (expiryMs < 7 * dayMs) {
        return 1 * 60 * 60 * 1000;
      } else if (expiryMs < 30 * dayMs) {
        return 6 * 60 * 60 * 1000;
      } else if (expiryMs < 90 * dayMs) {
        return 24 * 60 * 60 * 1000;
      }
    } catch {
      return defaultExpiry;
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
    cleanExpiredCache();
    try {
      localStorage.setItem(getCacheKey(domain), JSON.stringify(item));
    } catch {
      // ignore
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
    const limited = history.slice(0, MAX_HISTORY_SIZE);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
  } catch {
    const limited = history.slice(0, 10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
  }
}

function addToHistory(domain: string, success: boolean): void {
  const history = getHistory();
  const filtered = history.filter(h => h.domain.toLowerCase() !== domain.toLowerCase());
  filtered.unshift({ domain: domain.toLowerCase(), timestamp: Date.now(), success });
  setHistory(filtered);
}

function removeFromHistory(domain: string): void {
  const history = getHistory();
  const filtered = history.filter(h => h.domain.toLowerCase() !== domain.toLowerCase());
  setHistory(filtered);
  localStorage.removeItem(getCacheKey(domain));
  renderHistory();
}

function clearAllHistory(): void {
  const history = getHistory();
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
      console.error(t('errGetApiKey'), err);
    }
  }
}

// ========== UI 渲染 ==========

function renderHistory(): void {
  const historyList = document.getElementById('history-list');
  const historyDropdown = document.getElementById('history-dropdown');
  const historyCount = document.getElementById('history-count');

  if (!historyList || !historyDropdown || !historyCount) return;

  const history = getHistory();
  historyCount.textContent = String(history.length);

  if (history.length === 0) {
    historyDropdown.classList.add('hidden');
    return;
  }

  const locale = getLocale();
  historyList.innerHTML = history.map(item => {
    const date = new Date(item.timestamp);
    const timeStr = date.toLocaleString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="history-item flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-b-0">
        <div class="flex items-center gap-2 flex-1 min-w-0 cursor-pointer" onclick="handleHistoryClick('${escapeHtml(item.domain)}')">
          <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-sm text-gray-700 truncate">${escapeHtml(item.domain)}</span>
          <span class="text-xs text-gray-400 flex-shrink-0">${timeStr}</span>
        </div>
        <button
          onclick="event.stopPropagation(); handleDeleteHistory('${escapeHtml(item.domain)}')"
          class="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100"
          title="${t('delete')}"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `;
  }).join('');
}

// 显示/隐藏历史下拉
function showHistoryDropdown(): void {
  const history = getHistory();
  const historyDropdown = document.getElementById('history-dropdown');
  if (!historyDropdown || history.length === 0) return;
  
  renderHistory();
  historyDropdown.classList.remove('hidden');
}

function hideHistoryDropdown(): void {
  const historyDropdown = document.getElementById('history-dropdown');
  if (historyDropdown) {
    historyDropdown.classList.add('hidden');
  }
}

// ========== 主应用初始化 ==========

export async function initApp(): Promise<void> {
  // 初始化多语言
  initI18n();
  const locale = getLocale();
  const isZh = locale === 'zh-CN';

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
              <h1 class="text-base sm:text-xl font-bold text-gray-900">${t('pageTitle')}</h1>
              <p class="text-xs text-gray-500 hidden sm:block">${t('pageSubtitle')}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <a href="/docs.html" class="text-xs sm:text-sm text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg sm:rounded-md hover:bg-gray-100 sm:hover:bg-transparent">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span class="hidden sm:inline">${t('apiDocs')}</span>
            </a>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-12 w-full">
        <!-- Search Section -->
        <div class="text-center mb-6 sm:mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            ${isZh ? '域名 WHOIS 查询' : 'Domain WHOIS Lookup'}
          </h2>
          <p class="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8 px-2">
            ${isZh ? '输入域名查看详细的注册信息和 WHOIS 数据' : 'Enter a domain to view detailed registration and WHOIS information'}
          </p>

          <!-- Search Form -->
          <div class="max-w-2xl mx-auto">
            <form id="whois-form" class="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div class="flex-1 relative">
                <input
                  type="text"
                  id="domain-input"
                  name="domain"
                  placeholder="${t('searchPlaceholder')}"
                  autocomplete="off"
                  class="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-base sm:text-lg shadow-sm"
                />
                <!-- History Dropdown -->
                <div id="history-dropdown" class="hidden absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
                    <span class="text-xs text-gray-500">${t('searchHistory')} <span id="history-count" class="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">0</span></span>
                    <button type="button" onclick="handleClearHistory()" class="text-xs text-gray-400 hover:text-red-500 transition-colors">${t('clearHistory')}</button>
                  </div>
                  <div id="history-list" class="max-h-64 overflow-y-auto"></div>
                </div>
              </div>
              <button
                type="submit"
                id="search-btn"
                class="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg id="search-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <span id="search-text">${t('query')}</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Results Section -->
        <div id="results-container" class="hidden">
          <!-- Cache Notice -->
          <div id="cache-notice" class="hidden mb-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-600 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>${t('fromCache')}</span>
            </div>
          </div>

          <!-- Loading State -->
          <div id="loading-state" class="hidden text-center py-8 sm:py-12">
            <div class="inline-flex items-center gap-3 text-gray-500">
              <svg class="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-sm sm:text-base">${t('querying')}</span>
            </div>
          </div>

          <!-- Error State -->
          <div id="error-state" class="hidden">
            <div class="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 text-center">
              <svg class="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3 class="text-base sm:text-lg font-semibold text-red-600 mb-2">${t('queryFailed')}</h3>
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
                    ${t('viewRawData')}
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
          <p>${t('poweredBy')} <a href="https://github.com/netcccyun/php-whois" target="_blank" class="text-blue-600 hover:text-blue-500">php-whois</a></p>
        </div>
      </footer>
    </div>
  `;

  // Initialize
  await initApiKey();
  initFormHandling();
  initHistoryDropdown();
  loadSiteSettings();
  renderHistory();

  // 绑定全局函数
  (window as unknown as Record<string, unknown>).removeFromHistory = undefined;
  (window as unknown as Record<string, unknown>).clearAllHistory = undefined;
  (window as unknown as Record<string, unknown>).handleHistoryClick = undefined;
  (window as unknown as Record<string, unknown>).handleDeleteHistory = undefined;
  (window as unknown as Record<string, unknown>).handleClearHistory = undefined;
  
  (window as unknown as { handleDeleteHistory: (domain: string) => void }).handleDeleteHistory = removeFromHistory;
  (window as unknown as { handleClearHistory: () => void }).handleClearHistory = clearAllHistory;
  (window as unknown as { handleHistoryClick: (domain: string) => void }).handleHistoryClick = handleHistoryClick;
}

// 初始化历史下拉事件
function initHistoryDropdown(): void {
  const domainInput = document.getElementById('domain-input') as HTMLInputElement;
  const historyDropdown = document.getElementById('history-dropdown');

  if (!domainInput || !historyDropdown) return;

  // 输入时显示下拉
  domainInput.addEventListener('focus', () => {
    showHistoryDropdown();
  });

  domainInput.addEventListener('input', () => {
    showHistoryDropdown();
  });

  // 点击其他地方隐藏下拉
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!domainInput.contains(target) && !historyDropdown.contains(target)) {
      hideHistoryDropdown();
    }
  });

  // 按 ESC 隐藏下拉
  domainInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideHistoryDropdown();
    }
  });

  // 选择历史后隐藏下拉
  domainInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      hideHistoryDropdown();
    }
  });
}

// 点击历史记录条目 - 立即查询
function handleHistoryClick(domain: string): void {
  // 直接触发查询
  performQuery(domain);
}

// 执行查询（提取为独立函数供多处调用）
async function performQuery(domain: string): Promise<void> {
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

  const cleanDomain = domain.trim().toLowerCase();

  // 更新输入框
  if (domainInput) {
    domainInput.value = cleanDomain;
  }

  // 隐藏下拉
  hideHistoryDropdown();

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
  searchText.textContent = t('querying');

  // 确保有 API Key
  if (!apiKey) {
    try {
      const keyResponse = await fetch('/api/keys/init');
      const keyData = await keyResponse.json();
      if (keyData.success && keyData.key) {
        apiKey = keyData.key;
        localStorage.setItem('whois_api_key', apiKey);
      } else {
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
        errorMessage.textContent = t('errGetApiKey');
        searchBtn.disabled = false;
        searchText.textContent = t('query');
        return;
      }
    } catch {
      loadingState.classList.add('hidden');
      errorState.classList.remove('hidden');
      errorMessage.textContent = t('errGetApiKey');
      searchBtn.disabled = false;
      searchText.textContent = t('query');
      return;
    }
  }

  // 检查缓存
  const cached = getCache(cleanDomain);
  if (cached) {
    loadingState.classList.add('hidden');
    successState.classList.remove('hidden');
    cacheNotice.classList.remove('hidden');
    displayResults(cached.data, cached.cachedAt, cached.expiresAt);
    searchBtn.disabled = false;
    searchIcon.classList.remove('animate-spin');
    searchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>`;
    searchText.textContent = t('query');
    return;
  }

  try {
    const response = await fetch(`/api/whois?domain=${encodeURIComponent(cleanDomain)}`, {
      headers: { 'X-API-Key': apiKey },
    });
    const data: WhoisResponse = await response.json();

    loadingState.classList.add('hidden');

    if (!data.success) {
      errorState.classList.remove('hidden');
      errorMessage.textContent = data.error || t('unknownError');
      addToHistory(cleanDomain, false);

      if (response.status === 401) {
        localStorage.removeItem('whois_api_key');
        apiKey = '';
      }
    } else {
      successState.classList.remove('hidden');
      displayResults(data);
      addToHistory(cleanDomain, true);
      setCache(cleanDomain, data);
    }
  } catch (error) {
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
    errorMessage.textContent = error instanceof Error ? error.message : t('networkError');
    addToHistory(cleanDomain, false);
  } finally {
    searchBtn.disabled = false;
    searchIcon.classList.remove('animate-spin');
    searchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>`;
    searchText.textContent = t('query');
    renderHistory();
  }
}

// ========== 表单处理 ==========

function initFormHandling(): void {
  const form = document.getElementById('whois-form') as HTMLFormElement;
  const domainInput = document.getElementById('domain-input') as HTMLInputElement;

  // 表单提交
  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault();
    const domain = domainInput.value.trim().toLowerCase();
    if (!domain) {
      domainInput.focus();
      return;
    }
    performQuery(domain);
  });

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

  if (data.queriedAt) {
    const locale = getLocale();
    resultTime.textContent = new Date(data.queriedAt).toLocaleString(locale === 'zh-CN' ? 'zh-CN' : 'en-US');
  } else {
    resultTime.textContent = '';
  }

  if (data.fromCache && cachedAt && expiresAt) {
    cacheInfo.classList.remove('hidden');
    const remainingMs = expiresAt - Date.now();
    const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000));
    const remainingMins = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
    if (remainingHours > 0) {
      cacheInfo.textContent = `${t('cacheRemaining')} ${remainingHours}${getLocale() === 'zh-CN' ? '小时' : 'h'}${remainingMins > 0 ? remainingMins + (getLocale() === 'zh-CN' ? '分钟' : 'm') : ''}`;
    } else {
      cacheInfo.textContent = `${t('cacheRemaining')} ${remainingMins}${getLocale() === 'zh-CN' ? '分钟' : 'min'}`;
    }
  } else {
    cacheInfo.classList.add('hidden');
  }

  const isZh = getLocale() === 'zh-CN';

  if (data.parsed && Object.keys(data.parsed).length > 0) {
    const parsed = data.parsed;
    let html = '';

    // 域名基础信息
    html += `<div class="col-span-1 sm:col-span-2 mb-2"><h3 class="text-xs sm:text-sm font-semibold text-blue-600 border-b border-gray-200 pb-1">${t('domainInfo')}</h3></div>`;

    const basicFields: Array<[string, string]> = [
      ['domain_name', t('fieldDomainName')],
      ['registry_domain_id', t('fieldRegistryDomainId')],
      ['registrar_whois_server', t('fieldWhoisServer')],
      ['registrar_url', t('fieldRegistrarWebsite')],
      ['creation_date', t('fieldCreationDate')],
      ['expiration_date', t('fieldExpirationDate')],
      ['updated_date', t('fieldUpdatedDate')],
    ];

    for (const [key, label] of basicFields) {
      const value = parsed[key];
      if (value) {
        html += createFieldCard(label, formatValue(value));
      }
    }

    // 注册商信息
    html += `<div class="col-span-1 sm:col-span-2 mb-2 mt-4"><h3 class="text-xs sm:text-sm font-semibold text-purple-600 border-b border-gray-200 pb-1">${t('registrarInfo')}</h3></div>`;

    const registrarFields: Array<[string, string]> = [
      ['registrar', t('fieldRegistrar')],
      ['registrar_iana_id', t('fieldRegistrarIanaId')],
      ['registrar_abuse_contact_email', t('fieldAbuseEmail')],
      ['registrar_abuse_contact_phone', t('fieldAbusePhone')],
    ];

    for (const [key, label] of registrarFields) {
      const value = parsed[key];
      if (value) {
        html += createFieldCard(label, formatValue(Array.isArray(value) ? value.join(', ') : value));
      }
    }

    // 域名状态
    const nsKeys = ['domain_status', 'status'];
    const statuses: string[] = [];
    for (const key of nsKeys) {
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
      html += `<div class="col-span-1 sm:col-span-2 mb-2 mt-4"><h3 class="text-xs sm:text-sm font-semibold text-amber-600 border-b border-gray-200 pb-1">${t('securityStatus')}（${statuses.length}${t('securityLockCount')}）</h3></div>`;
      for (const status of statuses) {
        const statusClass = status.includes('Prohibited') ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200';
        const statusText = status.replace(/(https?:\/\/[^\s]+)/g, `<a href="$1" target="_blank" class="text-blue-600 hover:text-blue-500">${isZh ? '查看详情' : 'View details'}</a>`);
        html += `
          <div class="col-span-1 sm:col-span-2 ${statusClass} border rounded-lg p-3">
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-1">${t('statusLocked')}</div>
            <div class="text-sm text-gray-800 break-all">${statusText}</div>
          </div>
        `;
      }
    }

    // DNS 服务器
    const dnsKeys = ['name_server', 'name_servers', 'nameserver', 'nameservers', 'nserver'];
    const nameServers: string[] = [];
    for (const key of dnsKeys) {
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
      html += `<div class="col-span-1 sm:col-span-2 mb-2 mt-4"><h3 class="text-xs sm:text-sm font-semibold text-green-600 border-b border-gray-200 pb-1">${t('fieldNameServers')}（${nameServers.length}${t('nameServerCount')}）</h3></div>`;
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
        dnssecValue = Array.isArray(parsed[key]) ? (parsed[key] as string[]).join(', ') : (parsed[key] as string);
        break;
      }
    }

    if (dnssecValue) {
      html += `<div class="col-span-1 sm:col-span-2 mb-2 mt-4"><h3 class="text-xs sm:text-sm font-semibold text-indigo-600 border-b border-gray-200 pb-1">${t('dnsInfo')}</h3></div>`;
      const dnssecClass = dnssecValue.toLowerCase().includes('signed') ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200';
      const dnssecText = dnssecValue.toLowerCase().includes('signed') ? t('dnssecSigned') : t('dnssecUnsigned');
      html += `
        <div class="col-span-1 sm:col-span-2 ${dnssecClass} border rounded-lg p-3">
          <div class="text-xs text-gray-500 uppercase tracking-wide mb-1">${t('fieldDnsSec')}</div>
          <div class="text-gray-800 text-sm">${dnssecText}</div>
        </div>
      `;
    }

    // 持有人信息
    const registrantFields: Array<[string, string]> = [
      ['registrant_name', t('fieldRegistrantName')],
      ['registrant_organization', t('fieldRegistrantOrg')],
      ['registrant_country', t('fieldRegistrantCountry')],
      ['registrant_email', t('fieldRegistrantEmail')],
    ];

    const hasRegistrant = registrantFields.some(([key]) => parsed[key]);
    if (hasRegistrant) {
      html += `<div class="col-span-1 sm:col-span-2 mb-2 mt-4"><h3 class="text-xs sm:text-sm font-semibold text-pink-600 border-b border-gray-200 pb-1">${t('registrantInfo')}</h3></div>`;
      for (const [key, label] of registrantFields) {
        const value = parsed[key];
        if (value) {
          html += createFieldCard(label, formatValue(Array.isArray(value) ? (value as string[]).join(', ') : value));
        }
      }
    }

    parsedInfo.innerHTML = html || `<p class="text-gray-500 col-span-1 sm:col-span-2 text-center text-sm">${isZh ? '无法解析 WHOIS 数据' : 'Unable to parse WHOIS data'}</p>`;
  } else {
    parsedInfo.innerHTML = `<p class="text-gray-500 col-span-1 sm:col-span-2 text-center text-sm">${isZh ? '无法解析 WHOIS 数据' : 'Unable to parse WHOIS data'}</p>`;
  }

  rawData.textContent = data.raw || t('noRawData');
}

function createFieldCard(label: string, value: string): string {
  return `
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <div class="text-xs text-gray-500 uppercase tracking-wide mb-1">${label}</div>
      <div class="text-gray-800 text-sm break-all">${value}</div>
    </div>
  `;
}

function formatValue(value: string | string[]): string {
  const str = Array.isArray(value) ? value.join(', ') : value;
  return str.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-600 hover:text-blue-500">$1</a>');
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
        html += `<p>${t('poweredBy')} <a href="https://github.com/netcccyun/php-whois" target="_blank" class="text-blue-600 hover:text-blue-500">php-whois</a></p>`;
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

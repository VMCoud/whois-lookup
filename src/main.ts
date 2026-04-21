// WHOIS 查询 API 前端界面 - 亮色主题

// API Key 存储在 localStorage
let apiKey = localStorage.getItem('whois_api_key') || '';

interface WhoisResponse {
  success: boolean;
  domain: string;
  raw?: string;
  parsed?: Record<string, string | string[]>;
  error?: string;
  queriedAt?: string;
}

interface ApiKeyResponse {
  success: boolean;
  key?: string;
  keyPrefix?: string;
  message?: string;
  notice?: string;
  error?: string;
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

  app.innerHTML = `
    <div class="min-h-screen bg-gray-50 text-gray-800">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">WHOIS Lookup</h1>
              <p class="text-xs text-gray-500">域名查询服务</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <a href="/admin.html" class="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              管理后台
            </a>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-5xl mx-auto px-6 py-12">
        <!-- Search Section -->
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            域名 WHOIS 查询
          </h2>
          <p class="text-gray-500 mb-8">输入域名查看详细的注册信息和 WHOIS 数据</p>
          
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
                  class="w-full px-5 py-4 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-lg shadow-sm"
                />
              </div>
              <button 
                type="submit"
                id="search-btn"
                class="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold transition-all duration-200 flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div class="inline-flex items-center gap-3 text-gray-500">
              <svg class="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>正在查询 WHOIS 信息...</span>
            </div>
          </div>

          <!-- Error State -->
          <div id="error-state" class="hidden">
            <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <svg class="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3 class="text-lg font-semibold text-red-600 mb-2">查询失败</h3>
              <p id="error-message" class="text-red-500"></p>
            </div>
          </div>

          <!-- Success State -->
          <div id="success-state" class="hidden">
            <!-- Domain Info Card -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
              <div class="bg-gradient-to-r from-blue-600/10 to-cyan-600/10 px-6 py-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                    <span id="result-domain" class="text-lg font-semibold text-gray-900"></span>
                  </div>
                  <span id="result-time" class="text-sm text-gray-500"></span>
                </div>
              </div>
              <div class="p-6">
                <!-- Parsed Info Grid -->
                <div id="parsed-info" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"></div>
                
                <!-- Raw Data Toggle -->
                <details class="group">
                  <summary class="cursor-pointer text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2">
                    <svg class="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                    查看原始 WHOIS 数据
                  </summary>
                  <div class="mt-4">
                    <pre id="raw-data" class="bg-gray-100 rounded-lg p-4 text-xs text-gray-600 overflow-x-auto max-h-96 overflow-y-auto font-mono whitespace-pre-wrap"></pre>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="border-t border-gray-200 mt-16 bg-white">
        <div class="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-gray-500">
          <p>Powered by <a href="https://github.com/netcccyun/php-whois" target="_blank" class="text-blue-600 hover:text-blue-500">php-whois</a></p>
        </div>
      </footer>
    </div>
  `;

  // Initialize
  initFormHandling();
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

  // 自动获取默认 API Key
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
      } catch (err) {
        console.error('获取 API Key 失败');
        return false;
      }
    }
    return !!apiKey;
  }

  // 表单提交
  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    const domain = domainInput.value.trim();
    if (!domain) {
      domainInput.focus();
      return;
    }

    // 显示加载状态
    resultsContainer.classList.remove('hidden');
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

    try {
      const response = await fetch(`/api/whois?domain=${encodeURIComponent(domain)}`, {
        headers: { 'X-API-Key': apiKey },
      });
      const data: WhoisResponse = await response.json();

      loadingState.classList.add('hidden');

      if (!data.success) {
        errorState.classList.remove('hidden');
        errorMessage.textContent = data.error || '未知错误';

        if (response.status === 401) {
          localStorage.removeItem('whois_api_key');
          apiKey = '';
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
      searchBtn.disabled = false;
      searchIcon.classList.remove('animate-spin');
      searchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>`;
      searchText.textContent = '查询';
    }
  });

  // 回车键支持
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

  resultDomain.textContent = data.domain;
  resultTime.textContent = data.queriedAt ? new Date(data.queriedAt).toLocaleString('zh-CN') : '';

  if (data.parsed && Object.keys(data.parsed).length > 0) {
    const parsed = data.parsed;
    let html = '';

    // 域名基础信息
    html += `<div class="col-span-2 mb-2"><h3 class="text-sm font-semibold text-blue-600 border-b border-gray-200 pb-1">域名基础信息</h3></div>`;

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
    html += `<div class="col-span-2 mb-2 mt-4"><h3 class="text-sm font-semibold text-purple-600 border-b border-gray-200 pb-1">注册商信息</h3></div>`;

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
      html += `<div class="col-span-2 mb-2 mt-4"><h3 class="text-sm font-semibold text-amber-600 border-b border-gray-200 pb-1">域名状态（${statuses.length}项安全锁定）</h3></div>`;
      for (const status of statuses) {
        const statusClass = status.includes('Prohibited') ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200';
        const statusText = status.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-600 hover:text-blue-500">查看详情</a>');
        html += `
          <div class="col-span-2 ${statusClass} border rounded-lg p-3">
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-1">锁定状态</div>
            <div class="text-sm text-gray-800">${statusText}</div>
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
      html += `<div class="col-span-2 mb-2 mt-4"><h3 class="text-sm font-semibold text-green-600 border-b border-gray-200 pb-1">DNS 服务器（${nameServers.length}台）</h3></div>`;
      for (const ns of nameServers) {
        html += `
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div class="text-gray-800 font-medium">${escapeHtml(ns.toUpperCase())}</div>
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
      html += `<div class="col-span-2 mb-2 mt-4"><h3 class="text-sm font-semibold text-indigo-600 border-b border-gray-200 pb-1">DNS 安全</h3></div>`;
      const dnssecClass = dnssecValue.toLowerCase().includes('signed') ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200';
      const dnssecText = dnssecValue.toLowerCase().includes('signed') ? 'DNSSEC 已开启（已签名）' : 'DNSSEC 未开启（未签名）';
      html += `
        <div class="col-span-2 ${dnssecClass} border rounded-lg p-3">
          <div class="text-xs text-gray-500 uppercase tracking-wide mb-1">DNSSEC 状态</div>
          <div class="text-gray-800">${dnssecText}</div>
        </div>
      `;
    }

    // 持有人信息
    const registrantFields: Array<[string, string]> = [
      ['registrant_name', '注册人姓名'],
      ['registrant_organization', '注册组织'],
      ['registrant_country', '注册国家'],
    ];

    let hasRegistrant = registrantFields.some(([key]) => parsed[key]);
    if (hasRegistrant) {
      html += `<div class="col-span-2 mb-2 mt-4"><h3 class="text-sm font-semibold text-pink-600 border-b border-gray-200 pb-1">持有人信息</h3></div>`;
      for (const [key, label] of registrantFields) {
        const value = parsed[key];
        if (value) {
          html += createFieldCard(label, formatValue(Array.isArray(value) ? value.join(', ') : value));
        }
      }
    }

    parsedInfo.innerHTML = html || '<p class="text-gray-500 col-span-2 text-center">无法解析 WHOIS 数据</p>';
  } else {
    parsedInfo.innerHTML = '<p class="text-gray-500 col-span-2 text-center">无法解析 WHOIS 数据</p>';
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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

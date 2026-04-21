// 管理后台 - API Key 管理界面 - 亮色主题 + 移动端适配

interface ApiKeyInfo {
  keyPrefix: string;
  name: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsed: string | null;
  requestCount: number;
  remainingDays: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 会话 Token
let adminToken = localStorage.getItem('admin_token') || '';

export function initAdminApp(): void {
  const app = document.getElementById('app');

  if (!app) {
    console.error('App element not found');
    return;
  }

  // 检查是否已登录
  if (!adminToken) {
    renderLoginPage(app);
  } else {
    renderAdminPage(app);
    checkLoginStatus();
  }
}

function renderLoginPage(app: HTMLElement): void {
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <div class="text-center mb-6 sm:mb-8">
            <div class="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 sm:mb-4">
              <svg class="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h1 class="text-xl sm:text-2xl font-bold text-gray-900">管理后台</h1>
            <p class="text-gray-500 mt-2 text-sm sm:text-base">请登录以管理 API Keys</p>
          </div>

          <form id="login-form" class="space-y-4 sm:space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
              <input 
                type="text" 
                id="username"
                placeholder="请输入用户名"
                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <input 
                type="password" 
                id="password"
                placeholder="请输入密码"
                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              />
            </div>
            <button 
              type="submit"
              id="login-btn"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold transition-all flex items-center justify-center gap-2"
            >
              <span id="login-text">登录</span>
            </button>
          </form>

          <div id="login-error" class="hidden mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center"></div>

          <div class="mt-5 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
            <p class="text-xs text-gray-500 text-center">
              默认账户: admin / admin123<br/>
              生产环境请设置环境变量 ADMIN_USERNAME 和 ADMIN_PASSWORD
            </p>
          </div>

          <div class="mt-5 sm:mt-6 text-center">
            <a href="/" class="text-sm text-blue-600 hover:text-blue-500">返回首页</a>
          </div>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form') as HTMLFormElement;
  const loginBtn = document.getElementById('login-btn') as HTMLButtonElement;
  const loginText = document.getElementById('login-text') as HTMLSpanElement;
  const loginError = document.getElementById('login-error') as HTMLDivElement;

  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    const username = (document.getElementById('username') as HTMLInputElement).value.trim();
    const password = (document.getElementById('password') as HTMLInputElement).value;

    if (!username || !password) {
      loginError.textContent = '请输入用户名和密码';
      loginError.classList.remove('hidden');
      return;
    }

    loginBtn.disabled = true;
    loginText.textContent = '登录中...';

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data: ApiResponse<{ token: string }> = await response.json();

      if (data.success && data.token) {
        adminToken = data.token;
        localStorage.setItem('admin_token', adminToken);
        location.reload();
      } else {
        loginError.textContent = data.error || '登录失败';
        loginError.classList.remove('hidden');
        loginBtn.disabled = false;
        loginText.textContent = '登录';
      }
    } catch (error) {
      loginError.textContent = '网络错误，请重试';
      loginError.classList.remove('hidden');
      loginBtn.disabled = false;
      loginText.textContent = '登录';
    }
  });
}

function renderAdminPage(app: HTMLElement): void {
  app.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div class="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-base sm:text-xl font-bold text-gray-900">管理后台</h1>
              <p class="text-xs text-gray-500 hidden sm:block">API Key 管理</p>
            </div>
          </div>
          <div class="flex items-center gap-2 sm:gap-4">
            <a href="/" class="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg sm:rounded-none hover:bg-gray-100 sm:hover:bg-transparent">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              <span class="hidden sm:inline">返回首页</span>
            </a>
            <button id="logout-btn" class="text-xs sm:text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg sm:rounded-none hover:bg-gray-100 sm:hover:bg-transparent">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span class="hidden sm:inline">退出</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
        <!-- Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm text-gray-500">总 Keys</p>
                <p id="stat-total" class="text-2xl sm:text-3xl font-bold mt-1 text-gray-900">0</p>
              </div>
              <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm text-gray-500">活跃 Keys</p>
                <p id="stat-active" class="text-2xl sm:text-3xl font-bold mt-1 text-green-600">0</p>
              </div>
              <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm text-gray-500">即将过期</p>
                <p id="stat-expiring" class="text-2xl sm:text-3xl font-bold mt-1 text-yellow-500">0</p>
              </div>
              <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 col-span-2 lg:col-span-2">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs sm:text-sm text-gray-500">总请求量</p>
                <p id="stat-requests" class="text-2xl sm:text-3xl font-bold mt-1 text-purple-600">0</p>
              </div>
              <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Create New Key Section -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 class="text-base sm:text-lg font-semibold text-gray-900 mb-4">创建新的 API Key</h2>
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
            <div class="flex-1 min-w-0">
              <label class="block text-sm text-gray-600 mb-2">Key 名称</label>
              <input 
                type="text" 
                id="new-key-name"
                placeholder="例如: 我的应用"
                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
              />
            </div>
            <div class="sm:w-48">
              <label class="block text-sm text-gray-600 mb-2">有效期</label>
              <select 
                id="new-key-expires"
                class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none bg-white"
              >
                <option value="7">7 天</option>
                <option value="30" selected>30 天</option>
                <option value="90">90 天</option>
                <option value="180">180 天</option>
                <option value="365">365 天</option>
                <option value="0">永不过期</option>
              </select>
            </div>
            <button 
              id="create-key-btn"
              class="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span class="sm:hidden">创建</span>
              <span class="hidden sm:inline">创建 Key</span>
            </button>
          </div>

          <!-- New Key Display -->
          <div id="new-key-result" class="hidden mt-5 sm:mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div class="space-y-3">
              <p class="text-sm text-green-600 font-medium">新创建的 Key（请妥善保管，只显示一次）</p>
              <div class="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  id="new-key-value"
                  readonly
                  class="flex-1 px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-green-300 text-green-700 font-mono text-xs sm:text-sm"
                />
                <button id="copy-key-btn" class="px-4 py-2.5 sm:py-3 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 transition-colors text-sm whitespace-nowrap">
                  复制
                </button>
              </div>
              <div class="text-sm text-green-600">
                <span id="new-key-expires-info"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Keys List -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-base sm:text-lg font-semibold text-gray-900">API Keys 列表</h2>
            <button 
              id="refresh-btn"
              class="px-3 sm:px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm transition-colors flex items-center gap-1.5 sm:gap-2"
            >
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              刷新
            </button>
          </div>

          <!-- Desktop Table Header (hidden on mobile) -->
          <div class="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-sm text-gray-500 font-medium">
            <div class="col-span-2">名称</div>
            <div class="col-span-2">Key 前缀</div>
            <div class="col-span-2">创建时间</div>
            <div class="col-span-2">过期时间</div>
            <div class="col-span-1 text-center">剩余</div>
            <div class="col-span-1 text-center">请求</div>
            <div class="col-span-2 text-center">操作</div>
          </div>

          <!-- Keys List Container -->
          <div id="keys-list" class="divide-y divide-gray-100 md:divide-none">
            <div class="px-4 sm:px-6 py-8 text-center text-gray-500">
              加载中...
            </div>
          </div>
        </div>
      </main>

      <!-- Renew Modal -->
      <div id="renew-modal" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div class="p-5 sm:p-6 border-b border-gray-200">
            <h3 class="text-base sm:text-lg font-semibold text-gray-900">续期 API Key</h3>
            <p id="renew-key-name" class="text-sm text-gray-500 mt-1"></p>
          </div>
          <div class="p-5 sm:p-6">
            <label class="block text-sm text-gray-600 mb-2">设置新的过期时间</label>
            <select 
              id="renew-expires"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none bg-white"
            >
              <option value="7">7 天后过期</option>
              <option value="30">30 天后过期</option>
              <option value="90">90 天后过期</option>
              <option value="180">180 天后过期</option>
              <option value="365">365 天后过期</option>
              <option value="0">永不过期</option>
            </select>
          </div>
          <div class="p-4 border-t border-gray-200 flex justify-end gap-3">
            <button id="cancel-renew-btn" class="px-5 sm:px-6 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-sm">
              取消
            </button>
            <button id="confirm-renew-btn" class="px-5 sm:px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors text-sm">
              确认续期
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // 事件处理
  initAdminEventHandlers();
}

function initAdminEventHandlers(): void {
  // 退出登录
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'X-Admin-Token': adminToken },
      });
    } catch {}
    localStorage.removeItem('admin_token');
    adminToken = '';
    location.reload();
  });

  // 创建 Key
  document.getElementById('create-key-btn')?.addEventListener('click', createNewKey);

  // 刷新
  document.getElementById('refresh-btn')?.addEventListener('click', loadKeys);

  // 复制 Key
  document.getElementById('copy-key-btn')?.addEventListener('click', async () => {
    const keyInput = document.getElementById('new-key-value') as HTMLInputElement;
    await navigator.clipboard.writeText(keyInput.value);
    showToast('已复制到剪贴板');
  });

  // 续期弹窗
  document.getElementById('cancel-renew-btn')?.addEventListener('click', () => {
    document.getElementById('renew-modal')?.classList.add('hidden');
  });

  document.getElementById('confirm-renew-btn')?.addEventListener('click', () => {
    const keyPrefix = (document.getElementById('confirm-renew-btn') as HTMLButtonElement).dataset.keyPrefix;
    const expiresSelect = document.getElementById('renew-expires') as HTMLSelectElement;
    if (keyPrefix) {
      renewKey(keyPrefix, parseInt(expiresSelect.value));
    }
  });

  // 加载 Keys
  loadKeys();
}

async function checkLoginStatus(): Promise<void> {
  try {
    const response = await fetch('/api/admin/check', {
      headers: { 'X-Admin-Token': adminToken },
    });

    if (!response.ok) {
      localStorage.removeItem('admin_token');
      adminToken = '';
      location.reload();
    }
  } catch {
    // 忽略错误
  }
}

async function createNewKey(): Promise<void> {
  const nameInput = document.getElementById('new-key-name') as HTMLInputElement;
  const expiresSelect = document.getElementById('new-key-expires') as HTMLSelectElement;

  const name = nameInput.value.trim();
  const expiresInDays = parseInt(expiresSelect.value);

  if (!name) {
    showToast('请输入 Key 名称', 'error');
    return;
  }

  try {
    const response = await fetch('/api/keys', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Admin-Token': adminToken,
      },
      body: JSON.stringify({ name, expiresInDays }),
    });

    const data: ApiResponse<{ key: string; keyPrefix: string; expiresAt: string | null }> = await response.json();

    if (data.success && data.data) {
      const resultDiv = document.getElementById('new-key-result')!;
      const keyInput = document.getElementById('new-key-value') as HTMLInputElement;
      const expiresInfo = document.getElementById('new-key-expires-info')!;

      keyInput.value = data.data.key;
      expiresInfo.textContent = expiresInDays === 0 ? '永不过期' : `将于 ${formatDate(data.data.expiresAt!)} 到期`;
      resultDiv.classList.remove('hidden');

      nameInput.value = '';
      loadKeys();
      showToast('API Key 创建成功');
    } else {
      showToast(data.error || '创建失败', 'error');
    }
  } catch (error) {
    showToast('创建失败', 'error');
  }
}

async function loadKeys(): Promise<void> {
  const listContainer = document.getElementById('keys-list')!;
  const statTotal = document.getElementById('stat-total')!;
  const statActive = document.getElementById('stat-active')!;
  const statExpiring = document.getElementById('stat-expiring')!;
  const statRequests = document.getElementById('stat-requests')!;

  try {
    const response = await fetch('/api/keys', {
      headers: { 'X-Admin-Token': adminToken },
    });
    const data: ApiResponse<ApiKeyInfo[]> = await response.json();

    if (data.success && data.data) {
      const keys = data.data;

      statTotal.textContent = keys.length.toString();
      statActive.textContent = keys.filter(k => !isExpired(k.expiresAt)).length.toString();
      statExpiring.textContent = keys.filter(k => k.remainingDays !== null && k.remainingDays <= 7 && k.remainingDays > 0).length.toString();
      statRequests.textContent = keys.reduce((sum, k) => sum + k.requestCount, 0).toString();

      if (keys.length === 0) {
        listContainer.innerHTML = `
          <div class="px-4 sm:px-6 py-10 sm:py-12 text-center text-gray-500">
            <svg class="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
            <p>暂无 API Keys</p>
            <p class="text-sm mt-1">点击上方按钮创建第一个 Key</p>
          </div>
        `;
      } else {
        listContainer.innerHTML = keys.map(key => {
          const isKeyExpired = isExpired(key.expiresAt);
          const isExpiringSoon = key.remainingDays !== null && key.remainingDays <= 7 && key.remainingDays > 0;

          let statusColor = 'text-green-600 bg-green-50';
          let statusText = key.remainingDays === null ? '永久' : `${key.remainingDays} 天`;

          if (isKeyExpired) {
            statusColor = 'text-red-600 bg-red-50';
            statusText = '已过期';
          } else if (isExpiringSoon) {
            statusColor = 'text-yellow-600 bg-yellow-50';
          }

          // Desktop view (grid)
          const desktopView = `
            <div class="hidden md:grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
              <div class="col-span-2">
                <div class="font-medium text-gray-900 truncate">${escapeHtml(key.name)}</div>
              </div>
              <div class="col-span-2">
                <code class="text-sm text-gray-600 font-mono">${key.keyPrefix}***</code>
              </div>
              <div class="col-span-2 text-sm text-gray-600">
                ${formatDate(key.createdAt)}
              </div>
              <div class="col-span-2 text-sm ${isKeyExpired ? 'text-red-600' : 'text-gray-600'}">
                ${key.expiresAt ? formatDate(key.expiresAt) : '永不过期'}
              </div>
              <div class="col-span-1 text-center">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">
                  ${statusText}
                </span>
              </div>
              <div class="col-span-1 text-center text-gray-600">
                ${key.requestCount}
              </div>
              <div class="col-span-2 flex items-center justify-center gap-2">
                <button 
                  class="renew-btn px-3 py-1 rounded-lg text-xs bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                  data-key="${key.keyPrefix}"
                  data-name="${escapeHtml(key.name)}"
                >
                  续期
                </button>
                <button 
                  class="delete-btn px-3 py-1 rounded-lg text-xs bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  data-key="${key.keyPrefix}"
                  data-name="${escapeHtml(key.name)}"
                >
                  删除
                </button>
              </div>
            </div>
          `;

          // Mobile view (cards)
          const mobileView = `
            <div class="md:hidden p-4 border-b border-gray-100">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <div class="font-medium text-gray-900">${escapeHtml(key.name)}</div>
                  <code class="text-xs text-gray-500 font-mono">${key.keyPrefix}***</code>
                </div>
                <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">
                  ${statusText}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span class="text-gray-500">创建:</span>
                  <span class="text-gray-700 ml-1">${formatDate(key.createdAt)}</span>
                </div>
                <div>
                  <span class="text-gray-500">过期:</span>
                  <span class="${isKeyExpired ? 'text-red-600' : 'text-gray-700'} ml-1">${key.expiresAt ? formatDate(key.expiresAt) : '永不过期'}</span>
                </div>
                <div>
                  <span class="text-gray-500">请求:</span>
                  <span class="text-gray-700 ml-1">${key.requestCount}</span>
                </div>
              </div>
              <div class="flex gap-2">
                <button 
                  class="renew-btn flex-1 px-3 py-2 rounded-lg text-xs bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                  data-key="${key.keyPrefix}"
                  data-name="${escapeHtml(key.name)}"
                >
                  续期
                </button>
                <button 
                  class="delete-btn flex-1 px-3 py-2 rounded-lg text-xs bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  data-key="${key.keyPrefix}"
                  data-name="${escapeHtml(key.name)}"
                >
                  删除
                </button>
              </div>
            </div>
          `;

          return desktopView + mobileView;
        }).join('');

        listContainer.querySelectorAll('.renew-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            openRenewModal(target.dataset.key!, target.dataset.name!);
          });
        });

        listContainer.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            deleteKey(target.dataset.key!, target.dataset.name!);
          });
        });
      }
    }
  } catch (error) {
    listContainer.innerHTML = `
      <div class="px-4 sm:px-6 py-10 sm:py-12 text-center text-red-500">
        加载失败
      </div>
    `;
  }
}

function openRenewModal(keyPrefix: string, name: string): void {
  const modal = document.getElementById('renew-modal')!;
  const nameEl = document.getElementById('renew-key-name')!;
  const confirmBtn = document.getElementById('confirm-renew-btn') as HTMLButtonElement;

  nameEl.textContent = name;
  confirmBtn.dataset.keyPrefix = keyPrefix;
  modal.classList.remove('hidden');
}

async function renewKey(keyPrefix: string, expiresInDays: number): Promise<void> {
  try {
    const response = await fetch(`/api/keys/${keyPrefix}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'X-Admin-Token': adminToken,
      },
      body: JSON.stringify({ expiresInDays }),
    });

    const data: ApiResponse<{ expiresAt: string | null }> = await response.json();

    if (data.success) {
      document.getElementById('renew-modal')?.classList.add('hidden');
      loadKeys();
      showToast('续期成功');
    } else {
      showToast(data.error || '续期失败', 'error');
    }
  } catch {
    showToast('续期失败', 'error');
  }
}

async function deleteKey(keyPrefix: string, name: string): Promise<void> {
  if (!confirm(`确定要删除 "${name}" 吗？\n此操作不可恢复！`)) {
    return;
  }

  try {
    const response = await fetch(`/api/keys/${keyPrefix}`, { 
      method: 'DELETE',
      headers: { 'X-Admin-Token': adminToken },
    });
    const data: ApiResponse<void> = await response.json();

    if (data.success) {
      loadKeys();
      showToast('删除成功');
    } else {
      showToast(data.error || '删除失败', 'error');
    }
  } catch {
    showToast('删除失败', 'error');
  }
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message: string, type: 'success' | 'error' = 'success'): void {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm px-4 sm:px-6 py-3 rounded-xl shadow-lg z-50 transform transition-all duration-300 ${
    type === 'success' ? 'bg-green-600' : 'bg-red-600'
  } text-white text-sm`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initAdminApp();
});

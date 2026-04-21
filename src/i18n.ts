/**
 * 多语言配置文件
 * 支持: zh-CN (简体中文), en (English)
 */

export type Locale = 'zh-CN' | 'en';

export interface Translations {
  // 通用
  search: string;
  query: string;
  querying: string;
  cancel: string;
  confirm: string;
  delete: string;
  clear: string;
  save: string;
  reset: string;
  loading: string;
  success: string;
  error: string;
  warning: string;
  copy: string;
  copied: string;
  close: string;
  
  // 页面标题
  pageTitle: string;
  pageSubtitle: string;
  apiDocs: string;
  
  // 搜索
  searchPlaceholder: string;
  clearHistory: string;
  searchHistory: string;
  
  // 历史记录
  noHistory: string;
  historyCount: string;
  
  // 结果
  querySuccess: string;
  queryFailed: string;
  unknownError: string;
  networkError: string;
  invalidDomain: string;
  domainNotFound: string;
  serverTimeout: string;
  fromCache: string;
  cacheRemaining: string;
  queryTime: string;
  viewRawData: string;
  noRawData: string;
  
  // WHOIS 字段
  domainInfo: string;
  registrantInfo: string;
  registrarInfo: string;
  dnsInfo: string;
  securityStatus: string;
  
  fieldDomainName: string;
  fieldRegistryDomainId: string;
  fieldWhoisServer: string;
  fieldRegistrarWebsite: string;
  fieldCreationDate: string;
  fieldExpirationDate: string;
  fieldUpdatedDate: string;
  fieldRegistrar: string;
  fieldRegistrarIanaId: string;
  fieldAbuseEmail: string;
  fieldAbusePhone: string;
  fieldDomainStatus: string;
  fieldDnsSec: string;
  fieldNameServers: string;
  fieldRegistrantName: string;
  fieldRegistrantOrg: string;
  fieldRegistrantCountry: string;
  fieldRegistrantEmail: string;
  fieldRegistrantState: string;
  
  // 状态
  statusLocked: string;
  dnssecSigned: string;
  dnssecUnsigned: string;
  securityLockCount: string;
  nameServerCount: string;
  
  // 错误消息
  errApiKeyFailed: string;
  errGetApiKey: string;
  
  // 页脚
  poweredBy: string;
  
  // 管理后台
  adminTitle: string;
  apiKeyManagement: string;
  siteSettings: string;
  loginTitle: string;
  username: string;
  password: string;
  login: string;
  logout: string;
  loginError: string;
  loginSuccess: string;
  sessionExpired: string;
  pleaseLogin: string;
  
  // API Key 管理
  createKey: string;
  keyName: string;
  keyPrefix: string;
  expiresIn: string;
  createdAt: string;
  lastUsed: string;
  requestCount: string;
  remainingDays: string;
  expired: string;
  neverExpires: string;
  days: string;
  keyNamePlaceholder: string;
  noKeys: string;
  keyCreated: string;
  keyDeleted: string;
  keyRenewed: string;
  confirmDelete: string;
  cannotDelete: string;
  renew: string;
  extendDays: string;
  
  // 网站设置
  siteName: string;
  siteDescription: string;
  seoSettings: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  analyticsSettings: string;
  enableAnalytics: string;
  analyticsCode: string;
  footerSettings: string;
  footerText: string;
  icpNumber: string;
  settingsSaved: string;
  settingsReset: string;
  settingsResetConfirm: string;
  settingsFailed: string;
}

const translations: Record<Locale, Translations> = {
  'zh-CN': {
    // 通用
    search: '搜索',
    query: '查询',
    querying: '查询中...',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    clear: '清除',
    save: '保存',
    reset: '重置',
    loading: '加载中...',
    success: '成功',
    error: '错误',
    warning: '警告',
    copy: '复制',
    copied: '已复制',
    close: '关闭',
    
    // 页面标题
    pageTitle: 'WHOIS Lookup',
    pageSubtitle: '域名查询服务',
    apiDocs: 'API 文档',
    
    // 搜索
    searchPlaceholder: '输入域名，例如: google.com',
    clearHistory: '清除历史',
    searchHistory: '查询历史',
    
    // 历史记录
    noHistory: '暂无历史记录',
    historyCount: '条记录',
    
    // 结果
    querySuccess: '查询成功',
    queryFailed: '查询失败',
    unknownError: '未知错误',
    networkError: '网络请求失败',
    invalidDomain: '无效的域名格式',
    domainNotFound: '域名不存在',
    serverTimeout: 'WHOIS 服务器无响应',
    fromCache: '数据来自缓存',
    cacheRemaining: '缓存剩余',
    queryTime: '查询时间',
    viewRawData: '查看原始 WHOIS 数据',
    noRawData: '无原始数据',
    
    // WHOIS 字段
    domainInfo: '域名基础信息',
    registrantInfo: '持有人信息',
    registrarInfo: '注册商信息',
    dnsInfo: 'DNS 信息',
    securityStatus: '域名状态',
    
    fieldDomainName: '域名',
    fieldRegistryDomainId: '注册局 ID',
    fieldWhoisServer: 'WHOIS 服务器',
    fieldRegistrarWebsite: '注册商官网',
    fieldCreationDate: '创建时间',
    fieldExpirationDate: '到期时间',
    fieldUpdatedDate: '更新时间',
    fieldRegistrar: '注册商',
    fieldRegistrarIanaId: 'IANA 编号',
    fieldAbuseEmail: '滥用投诉邮箱',
    fieldAbusePhone: '滥用投诉电话',
    fieldDomainStatus: '锁定状态',
    fieldDnsSec: 'DNSSEC 状态',
    fieldNameServers: 'DNS 服务器',
    fieldRegistrantName: '注册人姓名',
    fieldRegistrantOrg: '注册组织',
    fieldRegistrantCountry: '注册国家',
    fieldRegistrantEmail: '注册人邮箱',
    fieldRegistrantState: '注册地区',
    
    // 状态
    statusLocked: '锁定状态',
    dnssecSigned: 'DNSSEC 已开启（已签名）',
    dnssecUnsigned: 'DNSSEC 未开启（未签名）',
    securityLockCount: '项安全锁定',
    nameServerCount: '台',
    
    // 错误消息
    errApiKeyFailed: 'API Key 无效或已过期',
    errGetApiKey: '获取 API Key 失败，请刷新页面重试',
    
    // 页脚
    poweredBy: 'Powered by',
    
    // 管理后台
    adminTitle: '管理后台',
    apiKeyManagement: 'API Key 管理',
    siteSettings: '网站设置',
    loginTitle: '管理员登录',
    username: '用户名',
    password: '密码',
    login: '登录',
    logout: '退出',
    loginError: '用户名或密码错误',
    loginSuccess: '登录成功',
    sessionExpired: '会话已过期，请重新登录',
    pleaseLogin: '请先登录',
    
    // API Key 管理
    createKey: '创建 Key',
    keyName: '名称',
    keyPrefix: '前缀',
    expiresIn: '过期时间',
    createdAt: '创建时间',
    lastUsed: '最后使用',
    requestCount: '请求次数',
    remainingDays: '剩余天数',
    expired: '已过期',
    neverExpires: '永不过期',
    days: '天',
    keyNamePlaceholder: '输入 Key 名称',
    noKeys: '暂无 API Key',
    keyCreated: 'API Key 创建成功',
    keyDeleted: 'API Key 已删除',
    keyRenewed: 'API Key 已续期',
    confirmDelete: '确定要删除这个 API Key 吗？',
    cannotDelete: '无法删除',
    renew: '续期',
    extendDays: '续期天数',
    
    // 网站设置
    siteName: '网站名称',
    siteDescription: '网站描述',
    seoSettings: 'SEO 设置',
    seoTitle: 'SEO 标题',
    seoDescription: 'SEO 描述',
    seoKeywords: 'SEO 关键词',
    analyticsSettings: '统计设置',
    enableAnalytics: '启用统计代码',
    analyticsCode: '统计代码',
    footerSettings: '页脚设置',
    footerText: '页脚文字',
    icpNumber: '备案号',
    settingsSaved: '设置已保存',
    settingsReset: '设置已重置',
    settingsResetConfirm: '确定要重置所有设置为默认值吗？',
    settingsFailed: '操作失败',
  },
  
  'en': {
    // General
    search: 'Search',
    query: 'Query',
    querying: 'Querying...',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    clear: 'Clear',
    save: 'Save',
    reset: 'Reset',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    copy: 'Copy',
    copied: 'Copied',
    close: 'Close',
    
    // Page titles
    pageTitle: 'WHOIS Lookup',
    pageSubtitle: 'Domain Query Service',
    apiDocs: 'API Docs',
    
    // Search
    searchPlaceholder: 'Enter domain, e.g., google.com',
    clearHistory: 'Clear History',
    searchHistory: 'Search History',
    
    // History
    noHistory: 'No search history',
    historyCount: 'records',
    
    // Results
    querySuccess: 'Query successful',
    queryFailed: 'Query failed',
    unknownError: 'Unknown error',
    networkError: 'Network request failed',
    invalidDomain: 'Invalid domain format',
    domainNotFound: 'Domain not found',
    serverTimeout: 'WHOIS server not responding',
    fromCache: 'From cache',
    cacheRemaining: 'Cache expires in',
    queryTime: 'Query time',
    viewRawData: 'View raw WHOIS data',
    noRawData: 'No raw data',
    
    // WHOIS fields
    domainInfo: 'Domain Information',
    registrantInfo: 'Registrant Information',
    registrarInfo: 'Registrar Information',
    dnsInfo: 'DNS Information',
    securityStatus: 'Security Status',
    
    fieldDomainName: 'Domain Name',
    fieldRegistryDomainId: 'Registry Domain ID',
    fieldWhoisServer: 'WHOIS Server',
    fieldRegistrarWebsite: 'Registrar Website',
    fieldCreationDate: 'Creation Date',
    fieldExpirationDate: 'Expiration Date',
    fieldUpdatedDate: 'Updated Date',
    fieldRegistrar: 'Registrar',
    fieldRegistrarIanaId: 'IANA ID',
    fieldAbuseEmail: 'Abuse Email',
    fieldAbusePhone: 'Abuse Phone',
    fieldDomainStatus: 'Domain Status',
    fieldDnsSec: 'DNSSEC Status',
    fieldNameServers: 'Name Servers',
    fieldRegistrantName: 'Registrant Name',
    fieldRegistrantOrg: 'Registrant Organization',
    fieldRegistrantCountry: 'Registrant Country',
    fieldRegistrantEmail: 'Registrant Email',
    fieldRegistrantState: 'Registrant State',
    
    // Status
    statusLocked: 'Lock Status',
    dnssecSigned: 'DNSSEC Signed',
    dnssecUnsigned: 'DNSSEC Not Signed',
    securityLockCount: 'security locks',
    nameServerCount: '',
    
    // Error messages
    errApiKeyFailed: 'Invalid or expired API key',
    errGetApiKey: 'Failed to get API key, please refresh and try again',
    
    // Footer
    poweredBy: 'Powered by',
    
    // Admin
    adminTitle: 'Admin Panel',
    apiKeyManagement: 'API Key Management',
    siteSettings: 'Site Settings',
    loginTitle: 'Admin Login',
    username: 'Username',
    password: 'Password',
    login: 'Login',
    logout: 'Logout',
    loginError: 'Invalid username or password',
    loginSuccess: 'Login successful',
    sessionExpired: 'Session expired, please login again',
    pleaseLogin: 'Please login first',
    
    // API Key management
    createKey: 'Create Key',
    keyName: 'Name',
    keyPrefix: 'Prefix',
    expiresIn: 'Expires',
    createdAt: 'Created',
    lastUsed: 'Last Used',
    requestCount: 'Requests',
    remainingDays: 'Remaining',
    expired: 'Expired',
    neverExpires: 'Never expires',
    days: 'days',
    keyNamePlaceholder: 'Enter key name',
    noKeys: 'No API keys',
    keyCreated: 'API key created',
    keyDeleted: 'API key deleted',
    keyRenewed: 'API key renewed',
    confirmDelete: 'Are you sure you want to delete this API key?',
    cannotDelete: 'Cannot delete',
    renew: 'Renew',
    extendDays: 'Extend days',
    
    // Site settings
    siteName: 'Site Name',
    siteDescription: 'Site Description',
    seoSettings: 'SEO Settings',
    seoTitle: 'SEO Title',
    seoDescription: 'SEO Description',
    seoKeywords: 'SEO Keywords',
    analyticsSettings: 'Analytics Settings',
    enableAnalytics: 'Enable Analytics',
    analyticsCode: 'Analytics Code',
    footerSettings: 'Footer Settings',
    footerText: 'Footer Text',
    icpNumber: 'ICP Number',
    settingsSaved: 'Settings saved',
    settingsReset: 'Settings reset',
    settingsResetConfirm: 'Are you sure you want to reset all settings to default?',
    settingsFailed: 'Operation failed',
  },
};

/**
 * 检测浏览器语言
 */
export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') {
    return 'zh-CN';
  }
  
  const lang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || 'zh-CN';
  
  // 优先匹配完整语言代码
  if (lang.startsWith('zh')) {
    return 'zh-CN';
  }
  if (lang.startsWith('en')) {
    return 'en';
  }
  
  // 检查 navigator.languages
  if (navigator.languages) {
    for (const l of navigator.languages) {
      if (l.startsWith('zh')) return 'zh-CN';
      if (l.startsWith('en')) return 'en';
    }
  }
  
  return 'zh-CN';
}

/**
 * 获取翻译函数
 */
export function createT(locale: Locale): Translations {
  return translations[locale] || translations['zh-CN'];
}

// 导出默认实例
let currentLocale: Locale = 'zh-CN';
let currentTranslations: Translations = translations['zh-CN'];

export function initI18n(): Locale {
  currentLocale = detectLocale();
  currentTranslations = translations[currentLocale];
  return currentLocale;
}

export function t(key: keyof Translations): string {
  return currentTranslations[key] || translations['zh-CN'][key] || key;
}

export function getLocale(): Locale {
  return currentLocale;
}

# 项目上下文

## 项目描述

WHOIS Lookup API - 封装自 [php-whois](https://github.com/netcccyun/php-whois) 的域名查询服务，支持 API Key 认证和过期时效管理。

## 技术栈

- **核心**: Vite 7, TypeScript, Express
- **UI**: Tailwind CSS
- **WHOIS**: node-whois 2.16.1

## 目录结构

```
├── scripts/            # 构建与启动脚本
│   ├── build.sh        # 构建脚本
│   ├── dev.sh          # 开发环境启动脚本
│   ├── prepare.sh      # 预处理脚本
│   └── start.sh        # 生产环境启动脚本
├── server/             # 服务端逻辑
│   ├── middleware/     # 中间件
│   │   ├── auth.ts    # API Key 认证中间件
│   │   └── seo.ts     # SEO 注入中间件（生产环境）
│   ├── plugins/       # Vite 插件
│   │   └── seo-plugin.ts  # SEO 注入插件（开发环境）
│   ├── routes/         # API 路由
│   │   ├── index.ts   # 路由总入口
│   │   ├── keys.ts    # API Key 管理接口
│   │   ├── settings.ts # 网站设置 API
│   │   └── whois.ts   # WHOIS 查询 API
│   ├── utils/         # 工具函数
│   │   └── settings.ts # 网站设置存储
│   ├── server.ts      # Express 服务入口
│   └── vite.ts        # Vite 中间件集成
├── src/               # 前端源码
│   ├── index.css      # 全局样式
│   ├── main.ts        # WHOIS 查询界面
│   ├── admin.ts       # 管理后台界面
│   └── docs.ts        # API 文档界面
├── index.html         # 入口 HTML
├── admin.html         # 管理后台 HTML
├── docs.html          # API 文档 HTML
├── package.json       # 项目依赖管理
├── tsconfig.json      # TypeScript 配置
└── vite.config.ts     # Vite 配置（含 SEO 插件）
```

## SEO 服务端注入

为了不影响 SEO，网站设置（标题、描述、关键词、备案号等）通过服务端注入的方式嵌入 HTML，而非前端动态获取。

### 实现方式

- **开发环境**: Vite 插件 `server/plugins/seo-plugin.ts` 在 `transformIndexHtml` 钩子中注入
- **生产环境**: Express 中间件 `server/middleware/seo.ts` 在 `res.send` 时注入

### 注入内容

```html
<!-- __SITE_CONFIG__ 全局配置 -->
<script>window.__SITE_CONFIG__ = {...};</script>

<!-- SEO meta 标签 -->
<title>...</title>
<meta name="description" content="...">
<meta name="keywords" content="...">
```

### 前端读取

前端代码从 `window.__SITE_CONFIG__` 同步读取配置，无需额外请求。

## 页面入口

- **首页**: http://localhost:5000/ - WHOIS 查询界面
- **管理后台**: http://localhost:5000/admin.html - API Key 管理后台

## API 接口

### WHOIS 查询（需要 API Key）

**GET** `/api/whois?domain=example.com`

查询域名的 WHOIS 信息。

**Headers:**
```
X-API-Key: YOUR_API_KEY
```

**POST** `/api/whois`

通过请求体查询，支持高级选项。

请求头:
```
X-API-Key: YOUR_API_KEY
Content-Type: application/json
```

请求体:
```json
{
  "domain": "example.com",
  "server": "whois.example.com",  // 可选：指定 WHOIS 服务器
  "follow": 2,                     // 可选：跟随重定向次数
  "timeout": 10000,               // 可选：超时时间(ms)
  "port": 43                      // 可选：WHOIS 端口
}
```

响应格式:
```json
{
  "success": true,
  "domain": "google.com",
  "raw": "...原始 WHOIS 文本...",
  "parsed": {
    "domain_name": "GOOGLE.COM",
    "registrar": "MarkMonitor Inc.",
    "creation_date": "1997-09-15T07:00:00+0000",
    "expiration_date": "2028-09-13T07:00:00+0000",
    "name_servers": ["NS1.GOOGLE.COM", "NS2.GOOGLE.COM"]
  },
  "queriedAt": "2024-01-15T10:30:00.000Z"
}
```

### API Key 管理

#### 获取默认 Key

**GET** `/api/keys/init`

首次访问时自动创建默认 API Key（30天有效期）。

响应:
```json
{
  "success": true,
  "key": "64字符的hex密钥",
  "keyPrefix": "前8位",
  "expiresInDays": 30
}
```

#### 创建新 Key

**POST** `/api/keys`

创建新的 API Key。

请求体:
```json
{
  "name": "My Application",
  "expiresInDays": 30  // 可选：过期天数，0 表示永不过期，默认永不过期
}
```

响应:
```json
{
  "success": true,
  "data": {
    "name": "My Application",
    "key": "完整密钥（仅返回一次）",
    "keyPrefix": "前8位",
    "expiresAt": "2024-02-15T10:30:00.000Z"
  }
}
```

#### 获取所有 Keys

**GET** `/api/keys`

列出所有已创建的 Keys（不包含完整密钥）。

响应:
```json
{
  "success": true,
  "data": [
    {
      "keyPrefix": "a1b2c3d4",
      "name": "Default Key",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "expiresAt": "2024-02-15T10:30:00.000Z",
      "lastUsed": "2024-01-15T11:00:00.000Z",
      "requestCount": 42,
      "remainingDays": 15
    }
  ]
}
```

#### 续期 Key

**PUT** `/api/keys/:keyPrefix`

续期指定的 API Key。

请求体:
```json
{
  "expiresInDays": 30  // 续期天数，0 表示永不过期
}
```

#### 删除 Key

**DELETE** `/api/keys/:keyPrefix`

删除指定的 API Key。

### 健康检查

**GET** `/api/health`

返回服务状态。

## API Key 过期时效

- **创建 Key**: 可设置过期天数（7/30/90/180/365 天）或永不过期
- **续期 Key**: 已过期的 Key 无法续期，需要重新创建
- **剩余天数**: 列表中显示每个 Key 的剩余有效天数
- **过期提醒**: 剩余 ≤7 天的 Key 会显示黄色警告

## 认证说明

- WHOIS 查询接口需要有效且未过期的 API Key
- API Key 通过请求头 `X-API-Key` 或查询参数 `apiKey` 传递
- 建议使用请求头方式，避免 Key 泄露在日志中
- 过期的 Key 将无法使用，需要续期或重新创建

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

- 使用 Tailwind CSS 进行样式开发
- API 路由位于 `server/routes/` 目录
- 中间件位于 `server/middleware/` 目录

### 编码规范

- 默认按 TypeScript `strict` 心智写代码；优先复用当前作用域已声明的变量、函数、类型和导入，禁止引用未声明标识符或拼错变量名。
- 禁止隐式 `any` 和 `as any`；函数参数、返回值、解构项、事件对象、Express `req`/`res`、`catch` 错误在使用前应有明确类型或先完成类型收窄，并清理未使用的变量和导入。

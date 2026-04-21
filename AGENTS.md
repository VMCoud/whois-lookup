# 项目上下文

## 项目描述

WHOIS Lookup API - 封装自 [php-whois](https://github.com/netcccyun/php-whois) 的域名查询服务，支持 API Key 认证。

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
│   │   └── auth.ts    # API Key 认证中间件
│   ├── routes/         # API 路由
│   │   ├── index.ts   # 路由总入口
│   │   ├── keys.ts    # API Key 管理接口
│   │   └── whois.ts   # WHOIS 查询 API
│   ├── server.ts      # Express 服务入口
│   └── vite.ts        # Vite 中间件集成
├── src/               # 前端源码
│   ├── index.css      # 全局样式
│   └── main.ts        # WHOIS 查询界面
├── index.html         # 入口 HTML
├── package.json       # 项目依赖管理
├── tsconfig.json      # TypeScript 配置
└── vite.config.ts     # Vite 配置
```

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

首次访问时自动创建默认 API Key。

响应:
```json
{
  "success": true,
  "key": "64字符的hex密钥",
  "keyPrefix": "前8位"
}
```

#### 创建新 Key

**POST** `/api/keys`

创建新的 API Key。

请求体:
```json
{
  "name": "My Application"
}
```

响应:
```json
{
  "success": true,
  "data": {
    "name": "My Application",
    "key": "完整密钥（仅返回一次）",
    "keyPrefix": "前8位"
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
      "lastUsed": "2024-01-15T11:00:00.000Z",
      "requestCount": 42
    }
  ]
}
```

#### 删除 Key

**DELETE** `/api/keys/:keyPrefix`

删除指定的 API Key。

### 健康检查

**GET** `/api/health`

返回服务状态。

## 认证说明

- WHOIS 查询接口需要 API Key 认证
- API Key 通过请求头 `X-API-Key` 或查询参数 `apiKey` 传递
- 建议使用请求头方式，避免 Key 泄露在日志中
- 可创建多个 Key 用于不同应用场景

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

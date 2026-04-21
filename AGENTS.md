# 项目上下文

## 项目描述

WHOIS Lookup API - 封装自 [php-whois](https://github.com/netcccyun/php-whois) 的域名查询服务。

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
│   ├── routes/         # API 路由
│   │   ├── index.ts    # 路由总入口
│   │   └── whois.ts    # WHOIS 查询 API
│   ├── server.ts       # Express 服务入口
│   └── vite.ts         # Vite 中间件集成
├── src/                # 前端源码
│   ├── index.css       # 全局样式
│   └── main.ts         # WHOIS 查询界面
├── index.html          # 入口 HTML
├── package.json        # 项目依赖管理
├── tsconfig.json       # TypeScript 配置
└── vite.config.ts      # Vite 配置
```

## API 接口

### WHOIS 查询

**GET** `/api/whois?domain=example.com`

查询域名的 WHOIS 信息。

**POST** `/api/whois`

通过请求体查询，支持高级选项。

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

### 健康检查

**GET** `/api/health`

返回服务状态。

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

### 编码规范

- 默认按 TypeScript `strict` 心智写代码；优先复用当前作用域已声明的变量、函数、类型和导入，禁止引用未声明标识符或拼错变量名。
- 禁止隐式 `any` 和 `as any`；函数参数、返回值、解构项、事件对象、Express `req`/`res`、`catch` 错误在使用前应有明确类型或先完成类型收窄，并清理未使用的变量和导入。

# WHOIS Lookup

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0-green.svg)](https://vitejs.dev/)

基于 [php-whois](https://github.com/netcccyun/php-whois) 的域名 WHOIS 查询服务，支持 API Key 认证和过期时效管理。

[在线演示](https://whois-lookup.dev.coze.site)

## 特性

- 🔍 **WHOIS 查询** - 支持全球主流域名后缀查询
- 🔑 **API Key 认证** - 安全可靠，支持过期时效管理
- 🌍 **多语言支持** - 自动识别浏览器语言 (简体中文 / English)
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 💾 **智能缓存** - 根据域名到期时间动态调整缓存策略
- 📜 **查询历史** - 自动保存，点击即可快速查询
- ⚡ **SEO 友好** - 服务端注入 SEO 配置
- 🐳 **Docker 支持** - 一键部署，支持 Docker 和 docker-compose

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:5000](http://localhost:5000)

### 构建生产版本

```bash
pnpm build
pnpm start
```

### Docker 部署

#### 构建镜像

```bash
# 构建镜像
docker build -t whois-lookup:latest .

# 或使用 docker-compose
docker-compose build
```

#### 运行容器

```bash
# 使用 docker run
docker run -d \
  --name whois-lookup \
  -p 5000:5000 \
  --restart unless-stopped \
  whois-lookup:latest

# 或使用 docker-compose
docker-compose up -d
```

#### 查看日志

```bash
docker logs -f whois-lookup
```

#### 停止服务

```bash
# docker run
docker stop whois-lookup && docker rm whois-lookup

# docker-compose
docker-compose down
```

## 项目结构

```
├── server/                  # 后端服务
│   ├── middleware/          # 中间件
│   │   ├── auth.ts        # API Key 认证
│   │   └── seo.ts         # SEO 注入（生产环境）
│   ├── plugins/           # Vite 插件
│   │   └── seo-plugin.ts  # SEO 注入（开发环境）
│   ├── routes/            # API 路由
│   │   ├── keys.ts       # API Key 管理
│   │   ├── settings.ts   # 网站设置
│   │   └── whois.ts      # WHOIS 查询
│   ├── utils/            # 工具函数
│   │   └── settings.ts   # 网站设置存储
│   ├── server.ts         # Express 服务入口
│   └── vite.ts          # Vite 中间件集成
├── src/                   # 前端源码
│   ├── index.css         # 全局样式
│   ├── main.ts          # WHOIS 查询界面
│   ├── admin.ts         # 管理后台
│   ├── docs.ts          # API 文档
│   └── i18n.ts          # 多语言配置
├── index.html            # 入口 HTML
├── admin.html            # 管理后台 HTML
├── docs.html            # API 文档 HTML
├── Dockerfile           # Docker 镜像构建文件
├── docker-compose.yml   # Docker Compose 配置
└── vite.config.ts       # Vite 配置
```

## API 接口

### WHOIS 查询

**GET** `/api/whois?domain=example.com`

**Headers:**
```
X-API-Key: YOUR_API_KEY
```

**响应:**
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
    "name_server": ["NS1.GOOGLE.COM", "NS2.GOOGLE.COM"]
  },
  "queriedAt": "2024-01-15T10:30:00.000Z"
}
```

### 获取 API Key

**GET** `/api/keys/init`

首次访问自动创建默认 Key（永不过期）。

### 创建新 Key

**POST** `/api/keys`

```json
{
  "name": "My Application",
  "expiresInDays": 30
}
```

### 获取所有 Keys

**GET** `/api/keys`

### 续期 Key

**PUT** `/api/keys/:keyPrefix`

```json
{
  "expiresInDays": 30
}
```

### 删除 Key

**DELETE** `/api/keys/:keyPrefix`

## 管理后台

访问 `/admin.html` 管理 API Keys 和网站设置。

### 认证配置

通过环境变量配置管理员账户：

```bash
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password
```

## 网站设置

支持配置：

- 网站名称
- SEO（标题、描述、关键词）
- 统计代码
- 页脚版权信息
- 备案号

## 技术栈

- **前端**: Vite + TypeScript + Tailwind CSS
- **后端**: Express + TypeScript
- **WHOIS**: node-whois
- **多语言**: i18n (zh-CN / en)

## License

MIT

# 私房菜点单小程序 v3.0 - EdgeOne Pages + CloudBase 部署指南

## 架构

```
前端 (EdgeOne Pages)  ──fetch──→  CloudBase 云函数  ──DB──→  CloudBase 文档数据库
    ↑ 静态 HTML                        ↑ Node.js 后端           ↑ NoSQL 文档型
```

## 前置条件

1. [腾讯云账号](https://cloud.tencent.com/)（需实名认证）
2. 安装 [Node.js](https://nodejs.org/) (v18+)

---

## 一、部署后端（CloudBase）

### 1. 开通 CloudBase

访问 https://console.cloud.tencent.com/tcb ，创建一个云开发环境：

- **环境名称**：`diancai`（可自定义）
- **计费方式**：选择「免费体验版」（每月3000资源点）
- **地域**：选择离你最近的地域（如上海）

### 2. 创建数据库集合

进入 CloudBase 控制台 → 数据库，创建以下集合：

| 集合名 | 说明 |
|--------|------|
| `categories` | 分类表 |
| `dishes` | 菜品表 |
| `orders` | 订单表 |
| `order_items` | 订单明细表 |
| `today_list` | 今日安排表 |

> **权限设置**：所有集合的安全规则设为「所有用户可读写」（这是一个家庭私用小程序，无需严格的权限控制）。

### 3. 初始化数据

在 CloudBase 控制台 → 数据库 → 脚本管理，新建脚本，将 `cloudbase/init-data.js` 的内容粘贴进去并执行。

或者使用 CloudBase CLI：

```bash
# 安装 CLI
npm install -g @cloudbase/cli

# 登录
cloudbase login

# 初始化数据（需要先在 cloudbase/init-data.js 中配置环境 ID）
cloudbase db:import cloudbase/init-data.js
```

### 4. 部署云函数

#### 方式一：通过 CloudBase CLI 部署（推荐）

```bash
cd cloudbase/functions/sifangcai-api

# 安装依赖
npm install

# 部署云函数
cloudbase functions:deploy sifangcai-api --envId 你的环境ID
```

#### 方式二：通过控制台上传

1. 进入 CloudBase 控制台 → 云函数
2. 新建云函数，名称：`sifangcai-api`
3. 运行时：`Nodejs 18.15`
4. 内存：256MB，超时时间：10秒
5. 将 `cloudbase/functions/sifangcai-api/index.js` 内容粘贴进去
6. 添加环境变量：`ADMIN_PASSWORD` = `laoda520`
7. 保存并部署

### 5. 创建 HTTP 触发器

1. 进入云函数 `sifangcai-api` → 触发器 → 创建触发器
2. 触发器类型：**HTTP 触发器**
3. 触发路径：`/api`
4. 请求方法：全选（GET/POST/PUT/DELETE/OPTIONS）

创建后你会得到一个 HTTP 触发器地址，类似：
```
https://your-env-id.apigw.tencentcs.com/api
```

> **记下这个地址**，下一步部署前端时需要用到。

---

## 二、部署前端（EdgeOne Pages）

### 方式一：通过 EdgeOne Pages 控制台（推荐，免费）

1. 访问 https://console.cloud.tencent.com/edgeone/pages
2. 点击「创建项目」→「直接上传」
3. 上传以下文件：
   - `点菜小程序/index.html`
   - `点菜小程序/image/` 整个目录
4. 点击部署

部署完成后你会得到一个域名，类似：`https://xxx.edgeone.app`

### 方式二：通过 GitHub 自动部署

1. 将项目推送到 GitHub
2. 在 EdgeOne Pages 中连接 GitHub 仓库
3. 设置构建输出目录为项目根目录
4. 自动部署

---

## 三、配置与测试

### 1. 首次访问

打开 EdgeOne Pages 部署的网址，首次访问会弹窗要求输入 API 地址：

```
https://你的环境ID.apigw.tencentcs.com/api
```

输入后即可正常使用。

### 2. 管理后台

- **进入方式**：连续点击页面标题 5 次
- **默认密码**：`laoda520`
- **修改密码**：在 CloudBase 控制台 → 云函数 → sifangcai-api → 环境变量 → 修改 `ADMIN_PASSWORD`

### 3. 后续修改 API 地址

点击页面标题下方的副标题文字（"给糖小宝准备的菜单~"），可以重新设置 API 地址。

---

## 四、免费额度

| 服务 | 免费额度 | 预估用量 |
|------|----------|----------|
| CloudBase 云函数 | 225万次/月调用 | 几百次 |
| CloudBase 文档数据库 | 15万次/月读写 | 几十次 |
| CloudBase 存储 | 约 25GB/天 | 几 MB |
| EdgeOne Pages | 免费，无硬性限制 | - |

> 对于家庭点菜场景，免费额度完全够用，无需担心费用。

---

## 五、目录结构（v3.0）

```
点菜小程序/
├── index.html                    # 前端页面（部署到 EdgeOne Pages）
├── image/                        # 菜品图片
├── cloudbase/                    # CloudBase 部署文件
│   ├── cloudbaserc.json          # CloudBase 配置
│   ├── package.json
│   ├── init-data.js              # 数据库初始化脚本
│   └── functions/
│       └── sifangcai-api/        # 云函数代码
│           ├── index.js          # API 路由处理
│           └── package.json
├── worker/                       # [旧版] Cloudflare Workers 后端
├── migration/                    # [旧版] D1 数据迁移
└── DEPLOY.md                     # 本文件
```

---

## 六、从 Cloudflare 迁移到 CloudBase 的差异

| 项目 | Cloudflare (v2.0) | CloudBase (v3.0) |
|------|-------------------|------------------|
| 后端平台 | Workers | 云函数 (SCF) |
| 数据库 | D1 (SQLite) | 文档数据库 (NoSQL) |
| 前端托管 | Cloudflare Pages | EdgeOne Pages |
| 国内访问 | 较慢/不稳定 | 快速稳定 |
| 免费额度 | 10万请求/天 | 225万次/月 |
| 备案要求 | 不需要 | 不需要 |

> **注意**：数据库从 SQLite 改为 NoSQL 后，API 接口保持不变，前端代码无需修改（只改了默认 API 地址）。

# 双验证服务 - Cloudflare Worker (reCAPTCHA + Turnstile)

本项目是一个基于 Cloudflare Workers 的验证服务，支持 **Google reCAPTCHA v2** 和 **Cloudflare Turnstile** 两种验证方式。用户可根据配置选择启用其中一种或同时启用两者。验证通过后，服务会生成一个 AES-GCM 加密的验证码，并提供在线解密工具以供验证。

## 功能特点

- ✅ 支持 Google reCAPTCHA v2（复选框）
- ✅ 支持 Cloudflare Turnstile（标准模式）
- 🔧 灵活的验证方式开关：可单独启用任一验证，或同时启用两者
- 🔐 AES-GCM 256 位加密生成唯一验证码
- 📱 响应式设计，移动端友好
- 🔄 实时验证状态反馈
- 📋 验证码一键复制功能
- 🔓 内置解密页面 (`/verify`)，用于还原加密内容

## 环境变量与配置

### 1. 获取必要的密钥对

#### reCAPTCHA v2
- 访问 [Google reCAPTCHA 管理控制台](https://www.google.com/recaptcha/admin/create)
- 选择 **reCAPTCHA v2** → **“我同意”复选框**
- 填写标签和域名（开发时可使用 `localhost` 或 Worker 域名）
- 提交后获得 **站点密钥 (Site Key)** 和 **密钥 (Secret Key)**

#### Cloudflare Turnstile
- 进入 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Turnstile
- 创建新站点，添加你的域名（Worker 域名）
- 获取 **站点密钥 (Site Key)** 和 **密钥 (Secret Key)**

### 2. 自定义加密密钥 (encsec)
- `encsec` 是用于 AES-GCM 加密的密钥，可以是任意字符串
- 建议使用强密码（例如 32 位随机字符串）
- **请务必妥善保管**，丢失后将无法解密已生成的验证码

### 3. 在 Worker 代码中设置常量

打开 `worker.js` 文件，在文件顶部找到以下配置区域，替换为你的实际值：

```javascript
// ==================== 配置变量 ====================
const encsec = "你的加密密钥";                       // 加密密钥
const g_sitekey = "你的 reCAPTCHA 站点密钥";          // reCAPTCHA 站点密钥
const g_sec = "你的 reCAPTCHA 密钥";                  // reCAPTCHA 密钥
const cf_sitekey = "你的 Turnstile 站点密钥";         // Turnstile 站点密钥
const cf_sec = "你的 Turnstile 密钥";                  // Turnstile 密钥

// 验证方式选择
const enable_recaptcha = true;   // 是否启用 reCAPTCHA
const enable_turnstile = true;   // 是否启用 Turnstile
// ==================================================
```

**注意**：  
- 若只需一种验证，可将另一个开关设为 `false`。
- 若两者均设为 `false`，验证将直接通过（何意味）。

#### 使用环境变量（推荐）
为提高安全性，建议将密钥存储为 Cloudflare Workers 的**机密环境变量**。注释配置区的有关代码，然后在 Worker 设置的 **变量和机密** 处或通过 Wrangler 设置对应的变量。

## 使用说明

### 验证流程
1. 访问 Worker 根路径 (`/`)。
2. 根据配置完成相应的验证：
   - reCAPTCHA：点击复选框完成挑战（若启用）。
   - Turnstile：自动或手动点击复选框（标准模式）。
3. 可选填写授权码（将附加北京时间后一起加密）。
4. 提交表单，若所有启用的验证均通过，页面将显示加密后的验证码。
5. 点击“复制代码”保存验证码，用于后续验证。

### 解密工具
访问 `/verify` 路径，可解密之前生成的加密字符串：
- 输入加密密钥 (`encsec`)
- 粘贴加密后的验证码
- 点击“解密”，获取原始内容（授权码 + 北京时间）

## API 端点

| 路径 | 方法 | 描述 |
|------|------|------|
| `/` | GET | 返回验证页面 |
| `/` | POST | 处理验证提交，返回加密验证码 |
| `/verify` | GET | 返回解密工具页面 |
| `/verify` | POST | 处理解密请求，返回原始内容 |

### POST `/verify` 参数
- `action`: 固定为 `"decrypt"`
- `encsec`: 加密密钥
- `code`: 加密字符串

返回结果：
```json
{"success":true,"decrypted":"授权码-YYYY年MM月DD日HH时MM分SS秒"}
```

## 技术细节

### 加密算法
- **算法**：AES-GCM 256 位
- **密钥派生**：PBKDF2（100,000 次迭代，SHA-256）
- **初始化向量**：12 字节随机值
- **输出格式**：IV 和密文组合后 Base64 编码

### 时间戳
- 采用北京时间（UTC+8）
- 格式：`-YYYY年MM月DD日HH时MM分SS秒`
- 与授权码拼接后一同加密

## 本地开发

### 前提条件
- [Node.js](https://nodejs.org/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### 快速开始
```bash
# 安装 Wrangler
npm install -g wrangler

# 初始化项目
wrangler init

# 编辑 worker.js，填入配置（或使用环境变量）
# ...

# 本地开发
wrangler dev
```

### 部署
```bash
# 部署到 Cloudflare
wrangler deploy
```

若使用环境变量，需先设置机密：
```bash
wrangler secret put encsec
wrangler secret put g_sec
wrangler secret put cf_sec
# 普通变量可在 wrangler.toml 中设置
```

## 安全建议

1. **定期更换加密密钥**：建议每 3-6 个月更换一次 `encsec`。
2. **限制访问**：可在 Worker 前添加 IP 白名单或自定义访问控制。
3. **监控用量**：通过 Cloudflare Analytics 监控验证请求量。
4. **备份密钥**：将 `encsec` 和 reCAPTCHA/Turnstile 密钥安全备份。

### 查看日志
```bash
wrangler tail
```

## 许可证

本项目基于 MIT 许可证开源。欢迎贡献和反馈。
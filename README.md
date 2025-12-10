# reCAPTCHA 验证服务 - Cloudflare Worker

这是一个基于 Cloudflare Workers 的 reCAPTCHA 验证服务，提供用户验证、加密验证码生成和解密功能。

## 功能特点

- ✅ Google reCAPTCHA v2 验证集成
- 🔐 AES-GCM 加密验证码生成
- 📱 响应式设计，移动端友好
- 🔄 验证结果状态显示
- 📋 验证码一键复制功能
- 🔓 在线解密工具

## 环境变量配置

### 1. 获取 reCAPTCHA 密钥对

#### 步骤：
1. 访问 [Google reCAPTCHA 管理控制台](https://www.google.com/recaptcha/admin/create)
2. 选择 **reCAPTCHA v2** → **"我同意"复选框**
3. 填写标签（如：My Site）
4. 在域名部分添加你的域名（对于 Cloudflare Worker，可以使用 `localhost` 或你的域名）
5. 点击"提交"

#### 获取以下两个密钥：
- **站点密钥 (Site Key)**：用于前端 reCAPTCHA 组件
- **密钥 (Secret Key)**：用于服务器端验证

### 2. 设置加密密钥 (encsec)

- **encsec** 是你自定义的加密密钥，用于 AES-GCM 加密算法
- 可以是任意字符串（建议使用强密码，如 32 位随机字符串）
- **重要**：请妥善保管此密钥，丢失后无法解密已生成的验证码

### 3. Cloudflare Worker 配置

#### 方法一：使用仪表板
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 Workers & Pages → 你的 Worker
3. 点击"设置" → "变量和机密"
4. 添加以下环境变量：

| 变量名 | 值 | 类型 |
|--------|-----|------|
| `sitekey` | 你的 reCAPTCHA 站点密钥 | 文本 |
| `recsec` | 你的 reCAPTCHA 密钥 | 密钥 |
| `encsec` | 你的自定义加密密钥 | 密钥 |

#### 方法二：使用 Wrangler CLI
创建 `wrangler.toml` 文件：

```toml
name = "recaptcha-worker"
main = "worker.js"
compatibility_date = "2023-12-01"

[vars]
sitekey = "你的站点密钥"

[env.production.vars]
sitekey = "你的站点密钥"

# 机密变量通过命令添加：
# wrangler secret put recsec
# wrangler secret put encsec
```

运行以下命令添加机密变量：
```bash
wrangler secret put recsec
wrangler secret put encsec
```

## 使用说明

### 验证流程
1. 用户访问 Worker 根路径 (`/`)
2. 完成 reCAPTCHA 验证（可选填写授权码）
3. 提交后生成加密验证码
4. 可以复制验证码用于后续验证

### 解密工具
访问 `/verify` 路径：
- 输入加密密钥 (encsec)
- 输入加密后的字符串
- 点击解密获取原始内容

## API 端点

### `GET /`
- 返回 reCAPTCHA 验证页面

### `POST /`
- 处理 reCAPTCHA 验证
- 返回加密后的验证码

### `GET /verify`
- 返回解密工具页面

### `POST /verify`
- 处理解密请求
- 参数：
  - `action`: "decrypt"
  - `encsec`: 加密密钥
  - `code`: 加密字符串
- 返回解密后的内容

## 技术细节

### 加密算法
- 使用 **AES-GCM** 256 位加密
- PBKDF2 密钥派生（100,000 次迭代）
- 随机初始化向量 (IV)
- Base64 编码输出

### 时间戳
- 使用北京时间（UTC+8）
- 格式：`-YYYY年MM月DD日HH时MM分SS秒`
- 附加在授权码后一起加密

## 本地开发

### 前提条件
- [Node.js](https://nodejs.org/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### 安装
```bash
npm install -g wrangler
```

### 本地测试
```bash
# 在项目目录中创建 wrangler.toml
wrangler init

# 设置本地变量
wrangler secret put recsec --local
wrangler secret put encsec --local

# 启动本地服务器
wrangler dev
```

### 部署
```bash
# 发布到 Cloudflare
wrangler deploy
```

## 安全建议

1. **定期更换密钥**：建议每 3-6 个月更换一次 `encsec`
2. **限制访问**：可以在 Worker 前添加额外的访问控制
3. **监控使用**：通过 Cloudflare Analytics 监控使用情况
4. **备份密钥**：安全地备份所有密钥

## 故障排除

### 常见问题

1. **reCAPTCHA 验证失败**
   - 检查 `recsec` 是否正确
   - 确认域名在 reCAPTCHA 控制台中已配置

2. **加密/解密失败**
   - 确认使用的 `encsec` 相同
   - 检查加密字符串是否完整复制

3. **Worker 无法访问**
   - 检查环境变量是否已正确配置
   - 查看 Worker 日志中的错误信息

### 日志查看
```bash
wrangler tail
```

## 许可证

本项目基于 MIT 许可证开源。

## 支持

如有问题，请：
1. 检查环境变量配置
2. 查看 Cloudflare Worker 日志
3. 确认 reCAPTCHA 密钥状态

---

**注意**：1.本服务需要有效的 reCAPTCHA 密钥对，请确保密钥未过期且有足够的配额。
本地开发部分由AI撰写，不保证其正确性。
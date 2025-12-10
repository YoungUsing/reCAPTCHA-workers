/**
const encsec = ""
const recsec = ""
const sitekey = ""
*/

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  if (url.pathname == "/") {
    if (request.method == "GET") {
      return new Response(`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>安全验证 | reCAPTCHA</title><style>*{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif}body{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:20px}.container{background:white;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.3);width:100%;max-width:450px;overflow:hidden}.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px;text-align:center}.header h1{font-size:28px;font-weight:600;margin-bottom:8px}.header p{opacity:0.9;font-size:16px}.form-container{padding:40px}.form-group{margin-bottom:30px}.form-group label{display:block;margin-bottom:10px;color:#333;font-weight:500;font-size:15px}.auth-input{width:100%;padding:16px 20px;border:2px solid #e0e0e0;border-radius:12px;font-size:16px;transition:all 0.3s ease;background:#f9f9f9}.auth-input:focus{outline:none;border-color:#667eea;background:white;box-shadow:0 0 0 3px rgba(102,126,234,0.1)}.auth-input::placeholder{color:#999}.optional-tag{background:#eef2ff;color:#667eea;font-size:12px;padding:4px 10px;border-radius:10px;margin-left:10px;font-weight:500}.captcha-container{margin:30px 0;display:flex;justify-content:center}.submit-btn{width:100%;padding:18px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;border:none;border-radius:12px;font-size:18px;font-weight:600;cursor:pointer;transition:all 0.3s ease;margin-top:10px;opacity:0.6;pointer-events:none}.submit-btn.enabled{opacity:1;pointer-events:auto}.submit-btn.enabled:hover{transform:translateY(-2px);box-shadow:0 10px 25px rgba(102,126,234,0.4)}.submit-btn.enabled:active{transform:translateY(0)}.status-message{text-align:center;margin-top:15px;font-size:14px;color:#666;height:20px}@media (max-width:480px){.form-container{padding:30px 25px}.header{padding:25px}}</style></head><body><div class="container"><div class="header"><h1>安全验证</h1><p>请完成验证以证明你是真人</p></div><div class="form-container"><form id="captchaForm" action="/" method="post"><div class="form-group"><label>授权码<span class="optional-tag">可选</span></label><input type="text" id="auth-code" name="authorization_code" placeholder="请输入授权码（如果需要）" class="auth-input"></div><div class="captcha-container"><div class="g-recaptcha" data-sitekey="`+sitekey+`" data-callback="onCaptchaSuccess" data-expired-callback="onCaptchaExpired"></div></div><div class="status-message" id="statusMessage"></div><button type="submit" class="submit-btn" id="submitBtn" disabled>提交验证</button></form></div></div><script src="https://www.recaptcha.net/recaptcha/api.js" async defer></script><script>let captchaVerified=false;function onCaptchaSuccess(response){captchaVerified=true;updateSubmitButton();document.getElementById('statusMessage').textContent='✓ 验证通过，现在可以提交了';document.getElementById('statusMessage').style.color='#10b981';}function onCaptchaExpired(){captchaVerified=false;updateSubmitButton();document.getElementById('statusMessage').textContent='验证已过期，请重新完成验证';document.getElementById('statusMessage').style.color='#ef4444';}function updateSubmitButton(){const submitBtn=document.getElementById('submitBtn');if(captchaVerified){submitBtn.classList.add('enabled');submitBtn.disabled=false;}else{submitBtn.classList.remove('enabled');submitBtn.disabled=true;}}document.addEventListener('DOMContentLoaded',function(){updateSubmitButton();document.getElementById('captchaForm').addEventListener('submit',function(e){if(!captchaVerified){e.preventDefault();document.getElementById('statusMessage').textContent='请先完成 reCAPTCHA 验证';document.getElementById('statusMessage').style.color='#ef4444';}});const authInput=document.getElementById('auth-code');authInput.addEventListener('focus',function(){this.parentElement.style.transform='scale(1.01)';});authInput.addEventListener('blur',function(){this.parentElement.style.transform='scale(1)';});});</script></body></html>`,
        {
          status: 200,
          headers: {
            "Content-Type": "text/html"
          }
        })
    }
    else {
      if (request.method == "POST") {
        var clientbody = await request.text()
        var clientdata = new URLSearchParams(clientbody)
        var clientsecret = clientdata.get("g-recaptcha-response")
        const beijingTimeStr = formatBeijingDateTime(new Date())
        var clientcode = clientdata.get("authorization_code")+beijingTimeStr
        var verify = await fetch("https://www.google.com/recaptcha/api/siteverify", {
          method: "POST",
          body: "secret="+recsec+"&response=" + clientsecret,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        })
        var verifyJSON = await verify.json()
        if (verifyJSON.success) {
          const verifycode = await encryptString(clientcode, encsec)
          return generateResultPage(true, verifycode)
        } else {
          return generateResultPage(false, null)
        }
      }
    }
  } else {
    if (url.pathname == "/verify") {
      if (request.method == "GET") {
        // 单行HTML解密页面
        const decryptPage = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>字符串解密工具</title><style>body{font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background-color:#f5f5f5}.container{background:white;padding:30px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}h1{color:#333;text-align:center}label{display:block;margin:15px 0 5px;color:#555;font-weight:bold}input,textarea,button{width:100%;padding:10px;margin-bottom:15px;border:1px solid #ddd;border-radius:5px;box-sizing:border-box}textarea{height:100px;font-family:monospace;resize:vertical}button{background-color:#007BFF;color:white;border:none;cursor:pointer;font-size:16px;font-weight:bold;transition:background-color 0.3s}button:hover{background-color:#0056b3}.result{margin-top:20px;padding:15px;background-color:#e9ffe9;border:1px solid #4CAF50;border-radius:5px;word-wrap:break-word}.error{margin-top:20px;padding:15px;background-color:#ffe9e9;border:1px solid #ff4c4c;border-radius:5px;color:#d00}</style></head><body><div class="container"><h1>🔐 字符串解密工具</h1><form id="decryptForm"><label for="encsec">解密密钥 (encsec):</label><input type="password" id="encsec" name="encsec" required placeholder="输入加密时使用的密钥"><label for="code">加密后的字符串:</label><textarea id="code" name="code" required placeholder="粘贴需要解密的字符串..."></textarea><button type="submit">解密</button></form><div id="result" style="display:none;"></div></div><script>document.getElementById('decryptForm').addEventListener('submit',async function(e){e.preventDefault();const encsec=document.getElementById('encsec').value;const code=document.getElementById('code').value;const resultDiv=document.getElementById('result');if(!encsec||!code){showError('请填写所有字段');return}try{const response=await fetch('/verify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({action:'decrypt',encsec:encsec,code:code})});const data=await response.json();if(data.success){resultDiv.innerHTML=\`<div class="result"><strong>✅ 解密成功！</strong><br><br><strong>原始内容:</strong><br><pre>\${data.decrypted}</pre><small>解密时间: \${new Date().toLocaleString()}</small></div>\`}else{showError(data.error||'解密失败')}}catch(error){showError('请求失败: '+error.message)}resultDiv.style.display='block';resultDiv.scrollIntoView({behavior:'smooth'})});function showError(message){const resultDiv=document.getElementById('result');resultDiv.innerHTML=\`<div class="error"><strong>❌ 错误:</strong><br>\${message}</div>\`;resultDiv.style.display='block'}</script></body></html>`
        return new Response(decryptPage, {
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
          }
        })
      } else {
        if (request.method == "POST") {
          try {
            const formData = await request.formData();
            const action = formData.get('action');
            const encsec = formData.get('encsec');
            const code = formData.get('code');

            if (action === 'decrypt' && encsec && code) {
              const decrypted = await decryptString(code, encsec);

              return new Response(JSON.stringify({
                success: true,
                decrypted: decrypted
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }

            throw new Error('缺少必要参数');
          } catch (error) {
            return new Response(JSON.stringify({
              success: false,
              error: error.message
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
      }
      // 其他请求方法
      return new Response('Method not allowed', { status: 405 });
    }
  }
  return new Response(null,{ status: 404 })
}





// 生成结果页面HTML
function generateResultPage(success, code) {
  const title = success ? '验证成功 | reCAPTCHA' : '验证失败 | reCAPTCHA';
  const headerClass = success ? 'success' : 'error';
  const headerTitle = success ? '验证成功' : '验证失败';
  const headerSubtitle = success ? '您的验证已通过' : '验证未通过';
  const icon = success ? '✓' : '✕';
  const iconStyle = success ? 'background:#d1fae5;color:#10b981;' : 'background:#fee2e2;color:#ef4444;';
  const message = success ? '恭喜！您已成功完成验证。您的唯一验证码已生成，请妥善保存。' : '抱歉，验证未能通过。请检查您的reCAPTCHA验证或授权码，然后重试。';
  const codeDisplay = success ? `${code}` : '';
  const uhtml = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title}</title><style>:root{--primary-gradient:linear-gradient(135deg,#667eea 0%,#764ba2 100%);--success-gradient:linear-gradient(135deg,#10b981 0%,#059669 100%);--error-gradient:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);--white:#fff;--gray-light:#f9f9f9;--gray-border:#e0e0e0;--gray-text:#666;--success:#10b981;--error:#ef4444;--shadow:0 20px 60px rgba(0,0,0,0.3);--code-bg:#f3f4f6;--code-text:#1f2937}body,html{margin:0;padding:0;width:100%;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif}.result-wrapper{background:var(--primary-gradient);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:20px}.result-container{background:var(--white);border-radius:20px;box-shadow:var(--shadow);width:100%;max-width:400px;overflow:hidden}.result-header{padding:25px 30px;text-align:center;color:var(--white)}.result-header.success{background:var(--success-gradient)}.result-header.error{background:var(--error-gradient)}.result-header h1{font-size:24px;font-weight:600;margin:0 0 8px 0}.result-header p{opacity:0.9;font-size:14px;margin:0}.result-content{padding:30px;text-align:center}.result-icon{width:80px;height:80px;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:36px;background:var(--gray-light)}.result-message{font-size:16px;color:var(--gray-text);margin-bottom:25px;line-height:1.5}.code-container{background:var(--code-bg);border-radius:12px;padding:20px;margin:20px 0;border:1px solid var(--gray-border)}.code-label{font-size:14px;color:var(--gray-text);margin-bottom:8px;text-align:left}.code-display-wrapper{display:flex;gap:10px;align-items:center}.code-display{flex:1;font-family:'Courier New',monospace;font-size:18px;font-weight:bold;color:var(--code-text);background:var(--white);padding:12px;border-radius:8px;border:2px dashed #d1d5db;word-break:break-all;text-align:center}.copy-btn{background:var(--primary-gradient);color:var(--white);border:none;border-radius:8px;padding:12px 16px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s ease;white-space:nowrap}.copy-btn:hover{opacity:0.9;transform:translateY(-1px)}.result-actions{margin-top:30px}.back-btn{display:inline-block;padding:12px 24px;background:var(--primary-gradient);color:var(--white);border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;transition:all 0.2s ease}.back-btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(102,126,234,0.3)}@media (max-width:480px){.result-content{padding:20px}.result-header{padding:20px}.code-display-wrapper{flex-direction:column}.copy-btn{width:100%}}</style></head><body><div class="result-wrapper"><div class="result-container"><div class="result-header ${headerClass}"><h1>${headerTitle}</h1><p>${headerSubtitle}</p></div><div class="result-content"><div class="result-icon" style="${iconStyle}">${icon}</div><div class="result-message">${message}</div>${success ? `<div class="code-container"><div class="code-label">验证代码：</div><div class="code-display-wrapper"><div class="code-display" id="codeText">${codeDisplay}</div><button class="copy-btn" onclick="copyCode()">复制代码</button></div></div>` : ''}<div class="result-actions"><a href="javascript:history.back()" class="back-btn">返回上一页</a></div></div></div></div><script>function copyCode(){const codeText=document.getElementById('codeText');navigator.clipboard.writeText(codeText.textContent).then(()=>{const originalText=codeText.nextElementSibling.textContent;codeText.nextElementSibling.textContent='复制成功';setTimeout(()=>{codeText.nextElementSibling.textContent=originalText;},1500);}).catch(err=>{console.error('复制失败:',err);});}</script></body></html>`
  return new Response(uhtml, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    }
  })
}




// 密钥处理函数：将任意字符串转换为符合 AES-GCM 要求的密钥
async function getKeyMaterial(encsec) {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(encsec),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
}

// 生成加密密钥
async function getEncryptionKey(encsec) {
  const keyMaterial = await getKeyMaterial(encsec);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode("Cloudflare Worker Salt"),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// 加密函数
async function encryptString(text, encsec) {
  try {
    const key = await getEncryptionKey(encsec);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encoded = encoder.encode(text);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encoded
    );

    // 组合 IV + 加密数据，转换为 base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    throw new Error(`加密失败: ${error.message}`);
  }
}

// 解密函数
async function decryptString(encryptedBase64, encsec) {
  try {
    const key = await getEncryptionKey(encsec);

    // 解码 base64
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

    // 分离 IV 和加密数据
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error(`解密失败: ${error.message}`);
  }
}

function formatBeijingDateTime(date) {
  // 北京时间 = UTC时间 + 8小时
  const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);

  const year = beijingTime.getUTCFullYear();
  const month = String(beijingTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getUTCDate()).padStart(2, '0');
  const hours = String(beijingTime.getUTCHours()).padStart(2, '0');
  const minutes = String(beijingTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(beijingTime.getUTCSeconds()).padStart(2, '0');

  return `-${year}年${month}月${day}日${hours}时${minutes}分${seconds}秒`;
}

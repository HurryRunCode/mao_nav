// functions/_middleware.js

async function basicAuth(context) {
  // 1. 从环境变量中获取你设定的用户名和密码
  const USER = context.env.BASIC_USER;
  const PASS = context.env.BASIC_PASS;

  // 2. 检查环境变量是否设置
  if (!USER || !PASS) {
    return new Response('Username or password not set', { status: 500 });
  }

  // 3. 检查请求头中是否包含 "Authorization" 信息
  const authHeader = context.request.headers.get('Authorization');

  if (!authHeader) {
    return sendAuthResponse();
  }

  // 4. 解码并验证 Authorization 信息
  const [scheme, encoded] = authHeader.split(' ');

  // 验证格式是否为 "Basic base64_encoded_string"
  if (scheme !== 'Basic' || !encoded) {
    return sendAuthResponse();
  }

  const [username, password] = atob(encoded).split(':');

  // 5. 比对用户名和密码
  if (username === USER && password === PASS) {
    // 验证通过，继续处理原始请求
    return await context.next();
  }

  // 验证失败，返回 401 Unauthorized
  return sendAuthResponse();
}

// 辅助函数，用于发送需要认证的响应
function sendAuthResponse() {
  return new Response('Authorization required', {
    status: 401,
    headers: {
      // 这个头信息会触发浏览器的密码输入弹窗
      'WWW-Authenticate': 'Basic realm="Protected Area"',
    },
  });
}

// 导出 onRequest 函数，Pages Functions 会自动调用它
export const onRequest = [basicAuth];

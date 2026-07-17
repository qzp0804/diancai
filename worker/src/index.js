// ============================================
// 私房菜点单小程序 - Cloudflare Workers API
// ============================================

// CORS 预检响应
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function error(msg, status = 400) {
  return json({ error: msg }, status);
}

// 简单的鉴权中间件：从 Authorization header 读取密码，对比环境变量
function checkAdmin(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '');
  return token === env.ADMIN_PASSWORD;
}

// ============ 路由 ============

export default {
  async fetch(request, env) {
    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // --- 公开接口 ---
      // GET /api/dishes?category_id=xxx
      if (path === '/api/dishes' && request.method === 'GET') {
        return await listDishes(env, url);
      }
      // GET /api/categories
      if (path === '/api/categories' && request.method === 'GET') {
        return await listCategories(env);
      }
      // POST /api/orders
      if (path === '/api/orders' && request.method === 'POST') {
        return await createOrder(request, env);
      }
      // GET /api/orders
      if (path === '/api/orders' && request.method === 'GET') {
        return await listOrders(env);
      }
      // GET /api/today
      if (path === '/api/today' && request.method === 'GET') {
        return await getToday(env);
      }
      // DELETE /api/today/:dish_id
      if (path.startsWith('/api/today/') && request.method === 'DELETE') {
        const dishId = parseInt(path.split('/').pop());
        return await removeToday(dishId, env);
      }

      // --- 管理员接口（需要密码）---
      // POST /api/auth - 验证密码
      if (path === '/api/auth' && request.method === 'POST') {
        return await authCheck(request, env);
      }

      // 以下接口需要管理员权限
      if (!checkAdmin(request, env)) {
        return error('需要管理员权限', 401);
      }

      // POST /api/dishes
      if (path === '/api/dishes' && request.method === 'POST') {
        return await addDish(request, env);
      }
      // PUT /api/dishes/:id
      if (path.match(/^\/api\/dishes\/\d+$/) && request.method === 'PUT') {
        const dishId = parseInt(path.split('/').pop());
        return await updateDish(dishId, request, env);
      }
      // DELETE /api/dishes/:id
      if (path.match(/^\/api\/dishes\/\d+$/) && request.method === 'DELETE') {
        const dishId = parseInt(path.split('/').pop());
        return await deleteDish(dishId, env);
      }
      // POST /api/categories
      if (path === '/api/categories' && request.method === 'POST') {
        return await addCategory(request, env);
      }
      // DELETE /api/categories/:id
      if (path.match(/^\/api\/categories\/\d+$/) && request.method === 'DELETE') {
        const catId = parseInt(path.split('/').pop());
        return await deleteCategory(catId, env);
      }

      return error('Not Found', 404);
    } catch (e) {
      console.error(e);
      return error('服务器内部错误: ' + e.message, 500);
    }
  },
};

// ============ 分类 ============

async function listCategories(env) {
  const { results } = await env.DB.prepare(
    'SELECT id, name FROM categories ORDER BY sort_order, id'
  ).all();
  return json(results);
}

async function addCategory(request, env) {
  const { name } = await request.json();
  if (!name || !name.trim()) return error('分类名称不能为空');
  const trimmed = name.trim();
  // 检查重复
  const exist = await env.DB.prepare('SELECT id FROM categories WHERE name = ?').bind(trimmed).first();
  if (exist) return error('分类已存在');
  const result = await env.DB.prepare('INSERT INTO categories (name) VALUES (?)').bind(trimmed).run();
  return json({ id: result.meta.last_row_id, name: trimmed }, 201);
}

async function deleteCategory(id, env) {
  const cat = await env.DB.prepare('SELECT id, name FROM categories WHERE id = ?').bind(id).first();
  if (!cat) return error('分类不存在', 404);
  // 删除分类下的菜品也会级联删除（CASCADE）
  await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
  return json({ success: true });
}

// ============ 菜品 ============

async function listDishes(env, url) {
  const categoryId = url.searchParams.get('category_id');
  let sql = `
    SELECT d.id, d.name, d.category_id, c.name as category, d.image, d.sales, d.created_at
    FROM dishes d
    LEFT JOIN categories c ON d.category_id = c.id
  `;
  const params = [];
  if (categoryId) {
    sql += ' WHERE d.category_id = ?';
    params.push(parseInt(categoryId));
  }
  sql += ' ORDER BY d.id';
  const { results } = await env.DB.prepare(sql).bind(...params).all();
  return json(results);
}

async function addDish(request, env) {
  const { name, category_id, image } = await request.json();
  if (!name || !name.trim()) return error('菜品名称不能为空');
  if (!category_id) return error('请选择分类');

  // 验证分类存在
  const cat = await env.DB.prepare('SELECT id FROM categories WHERE id = ?').bind(category_id).first();
  if (!cat) return error('分类不存在');

  const result = await env.DB.prepare(
    'INSERT INTO dishes (name, category_id, image) VALUES (?, ?, ?)'
  ).bind(name.trim(), category_id, image || '').run();

  return json({ id: result.meta.last_row_id }, 201);
}

async function updateDish(id, request, env) {
  const dish = await env.DB.prepare('SELECT id FROM dishes WHERE id = ?').bind(id).first();
  if (!dish) return error('菜品不存在', 404);

  const { name, category_id, image } = await request.json();
  const updates = [];
  const params = [];

  if (name !== undefined) { updates.push('name = ?'); params.push(name.trim()); }
  if (category_id !== undefined) { updates.push('category_id = ?'); params.push(category_id); }
  if (image !== undefined) { updates.push('image = ?'); params.push(image); }

  if (updates.length === 0) return error('没有需要更新的字段');

  params.push(id);
  await env.DB.prepare(`UPDATE dishes SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
  return json({ success: true });
}

async function deleteDish(id, env) {
  const dish = await env.DB.prepare('SELECT id FROM dishes WHERE id = ?').bind(id).first();
  if (!dish) return error('菜品不存在', 404);
  await env.DB.prepare('DELETE FROM dishes WHERE id = ?').bind(id).run();
  return json({ success: true });
}

// ============ 订单 ============

async function createOrder(request, env) {
  const { items } = await request.json();
  if (!items || !Array.isArray(items) || items.length === 0) {
    return error('订单内容不能为空');
  }

  // 开启事务：创建订单 + 写入明细 + 更新销量 + 更新今日安排
  const now = new Date().toISOString();
  const today = new Date().toISOString().slice(0, 10);

  // D1 批量操作
  const statements = [];

  // 1. 创建订单
  const orderResult = await env.DB.prepare(
    'INSERT INTO orders (created_at) VALUES (?)'
  ).bind(now).run();
  const orderId = orderResult.meta.last_row_id;

  // 2. 写入订单明细 + 更新销量 + 今日安排
  for (const item of items) {
    // 验证菜品存在
    const dish = await env.DB.prepare('SELECT id, name, sales FROM dishes WHERE id = ?').bind(item.dish_id).first();
    if (!dish) continue;

    // 写入明细
    await env.DB.prepare(
      'INSERT INTO order_items (order_id, dish_id, dish_name, qty) VALUES (?, ?, ?, ?)'
    ).bind(orderId, item.dish_id, dish.name, item.qty || 1).run();

    // 更新销量
    await env.DB.prepare(
      'UPDATE dishes SET sales = sales + ? WHERE id = ?'
    ).bind(item.qty || 1, item.dish_id).run();

    // 更新今日安排（忽略重复）
    await env.DB.prepare(
      'INSERT OR IGNORE INTO today_list (dish_id, date) VALUES (?, ?)'
    ).bind(item.dish_id, today).run();
  }

  return json({ id: orderId, created_at: now }, 201);
}

async function listOrders(env) {
  const { results: orders } = await env.DB.prepare(
    'SELECT id, created_at FROM orders ORDER BY id DESC LIMIT 50'
  ).all();

  // 查询每个订单的明细
  for (const order of orders) {
    const { results: items } = await env.DB.prepare(
      'SELECT dish_id, dish_name, qty FROM order_items WHERE order_id = ?'
    ).bind(order.id).all();
    order.items = items;
  }

  return json(orders);
}

// ============ 今日安排 ============

async function getToday(env) {
  const today = new Date().toISOString().slice(0, 10);
  const { results } = await env.DB.prepare(`
    SELECT t.id, t.dish_id, d.name, d.image, d.category_id, c.name as category, d.sales
    FROM today_list t
    JOIN dishes d ON t.dish_id = d.id
    LEFT JOIN categories c ON d.category_id = c.id
    WHERE t.date = ?
    ORDER BY t.id
  `).bind(today).all();
  return json(results);
}

async function removeToday(dishId, env) {
  const today = new Date().toISOString().slice(0, 10);
  await env.DB.prepare(
    'DELETE FROM today_list WHERE dish_id = ? AND date = ?'
  ).bind(dishId, today).run();
  return json({ success: true });
}

// ============ 认证 ============

async function authCheck(request, env) {
  const { password } = await request.json();
  if (password === env.ADMIN_PASSWORD) {
    return json({ token: env.ADMIN_PASSWORD });
  }
  return error('密码错误', 401);
}

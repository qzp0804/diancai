// ============================================
// 私房菜点单小程序 - CloudBase 云函数 API v3.0
// 替代 Cloudflare Workers + D1
// ============================================

const cloudbase = require('@cloudbase/node-sdk');

// 初始化 CloudBase（云函数内自动读取当前环境）
const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();
const _ = db.command;

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
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify(data),
  };
}

function error(msg, status = 400) {
  return json({ error: msg }, status);
}

// 鉴权：从 Authorization header 读取 token，对比环境变量
function checkAdmin(headers) {
  const auth = headers['authorization'] || headers['Authorization'] || '';
  const token = auth.replace('Bearer ', '');
  return token === process.env.ADMIN_PASSWORD;
}

// ============ 主入口 ============
exports.main = async (event, context) => {
  const { httpMethod, path, headers, queryStringParameters, body: rawBody } = event;

  // CORS 预检
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(),
      body: '',
    };
  }

  // 解析路径（CloudBase HTTP 触发器 path 格式为 /api/xxx）
  const apiPath = path || '';
  const pathParts = apiPath.replace(/^\/api/, '');

  // 解析 body
  let body = {};
  if (rawBody) {
    try { body = JSON.parse(rawBody); } catch (e) { /* ignore */ }
  }

  try {
    // --- 公开接口 ---
    if (pathParts === '/all' && httpMethod === 'GET') {
      return await getAll();
    }
    if (pathParts === '/dishes' && httpMethod === 'GET') {
      return await listDishes(queryStringParameters);
    }
    if (pathParts === '/categories' && httpMethod === 'GET') {
      return await listCategories();
    }
    if (pathParts === '/orders' && httpMethod === 'POST') {
      return await createOrder(body);
    }
    if (pathParts === '/orders' && httpMethod === 'GET') {
      return await listOrders();
    }
    if (pathParts === '/today' && httpMethod === 'GET') {
      return await getToday();
    }
    // DELETE /api/today/:dish_id
    if (pathParts.startsWith('/today/') && httpMethod === 'DELETE') {
      const dishId = parseInt(pathParts.split('/').pop());
      return await removeToday(dishId);
    }

    // --- 管理员接口 ---
    if (pathParts === '/auth' && httpMethod === 'POST') {
      return await authCheck(body);
    }

    if (!checkAdmin(headers)) {
      return error('需要管理员权限', 401);
    }

    if (pathParts === '/dishes' && httpMethod === 'POST') {
      return await addDish(body);
    }
    if (pathParts.match(/^\/dishes\/\d+$/) && httpMethod === 'PUT') {
      const dishId = parseInt(pathParts.split('/').pop());
      return await updateDish(dishId, body);
    }
    if (pathParts.match(/^\/dishes\/\d+$/) && httpMethod === 'DELETE') {
      const dishId = parseInt(pathParts.split('/').pop());
      return await deleteDish(dishId);
    }
    if (pathParts === '/categories' && httpMethod === 'POST') {
      return await addCategory(body);
    }
    if (pathParts.match(/^\/categories\/\d+$/) && httpMethod === 'PUT') {
      const catId = parseInt(pathParts.split('/').pop());
      return await updateCategory(catId, body);
    }
    if (pathParts.match(/^\/categories\/\d+$/) && httpMethod === 'DELETE') {
      const catId = parseInt(pathParts.split('/').pop());
      return await deleteCategory(catId);
    }

    return error('Not Found', 404);
  } catch (e) {
    console.error('API Error:', e);
    return error('服务器内部错误: ' + e.message, 500);
  }
};

// ============ 分类 ============

async function listCategories() {
  const res = await db.collection('categories').orderBy('sort_order', 'asc').orderBy('id', 'asc').get();
  return json(res.data);
}

async function addCategory(body) {
  const { name } = body;
  if (!name || !name.trim()) return error('分类名称不能为空');
  const trimmed = name.trim();

  // 检查重复
  const exist = await db.collection('categories').where({ name: trimmed }).count();
  if (exist.total > 0) return error('分类已存在');

  const res = await db.collection('categories').add({ name: trimmed, sort_order: 0 });
  return json({ id: res.id, name: trimmed }, 201);
}

async function updateCategory(id, body) {
  const { name } = body;
  if (!name || !name.trim()) return error('分类名称不能为空');
  const trimmed = name.trim();

  const cat = await db.collection('categories').where({ id }).get();
  if (cat.data.length === 0) return error('分类不存在', 404);

  await db.collection('categories').where({ id }).update({ name: trimmed });
  return json({ id, name: trimmed });
}

async function deleteCategory(id) {
  const cat = await db.collection('categories').where({ id }).get();
  if (cat.data.length === 0) return error('分类不存在', 404);

  // 删除分类
  await db.collection('categories').where({ id }).remove();
  // 级联删除该分类下的所有菜品
  await db.collection('dishes').where({ category_id: id }).remove();

  return json({ success: true });
}

// ============ 菜品 ============

async function listDishes(query) {
  let queryObj = db.collection('dishes').orderBy('id', 'asc');
  if (query && query.category_id) {
    queryObj = queryObj.where({ category_id: parseInt(query.category_id) });
  }
  const res = await queryObj.get();
  return json(res.data);
}

async function addDish(body) {
  const { name, category_id, image } = body;
  if (!name || !name.trim()) return error('菜品名称不能为空');
  if (!category_id) return error('请选择分类');

  // 验证分类存在
  const cat = await db.collection('categories').where({ id: category_id }).count();
  if (cat.total === 0) return error('分类不存在');

  const catInfo = await db.collection('categories').where({ id: category_id }).get();
  const catName = catInfo.data[0] ? catInfo.data[0].name : '';

  const res = await db.collection('dishes').add({
    name: name.trim(),
    category_id,
    category: catName,
    image: image || '',
    sales: 0,
    created_at: new Date().toISOString(),
  });

  return json({ id: res.id }, 201);
}

async function updateDish(id, body) {
  const dish = await db.collection('dishes').where({ id }).get();
  if (dish.data.length === 0) return error('菜品不存在', 404);

  const updates = {};
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.category_id !== undefined) {
    updates.category_id = body.category_id;
    // 同步更新分类名
    const cat = await db.collection('categories').where({ id: body.category_id }).get();
    if (cat.data.length > 0) updates.category = cat.data[0].name;
  }
  if (body.image !== undefined) updates.image = body.image;

  if (Object.keys(updates).length === 0) return error('没有需要更新的字段');

  await db.collection('dishes').where({ id }).update(updates);
  return json({ success: true });
}

async function deleteDish(id) {
  const dish = await db.collection('dishes').where({ id }).get();
  if (dish.data.length === 0) return error('菜品不存在', 404);

  await db.collection('dishes').where({ id }).remove();
  return json({ success: true });
}

// ============ 订单 ============

async function createOrder(body) {
  const { items } = body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return error('订单内容不能为空');
  }

  const now = new Date().toISOString();
  const today = new Date().toISOString().slice(0, 10);

  // 创建订单
  const orderRes = await db.collection('orders').add({ created_at: now });
  const orderId = orderRes.id;

  // 写入订单明细 + 更新销量 + 今日安排
  for (const item of items) {
    const dish = await db.collection('dishes').where({ id: item.dish_id }).get();
    if (dish.data.length === 0) continue;

    const d = dish.data[0];
    const qty = item.qty || 1;

    // 写入明细
    await db.collection('order_items').add({
      order_id: orderId,
      dish_id: item.dish_id,
      dish_name: d.name,
      qty,
    });

    // 更新销量（CloudBase 文档数据库没有原子自增，需先读后写）
    await db.collection('dishes').where({ id: item.dish_id }).update({
      sales: (d.sales || 0) + qty,
    });

    // 更新今日安排（检查是否已存在）
    const existToday = await db.collection('today_list').where({
      dish_id: item.dish_id,
      date: today,
    }).count();

    if (existToday.total === 0) {
      await db.collection('today_list').add({
        dish_id: item.dish_id,
        date: today,
      });
    }
  }

  return json({ id: orderId, created_at: now }, 201);
}

async function listOrders() {
  const res = await db.collection('orders').orderBy('id', 'desc').limit(50).get();
  const orders = res.data;

  for (const order of orders) {
    const itemsRes = await db.collection('order_items').where({ order_id: order.id }).get();
    order.items = itemsRes.data.map(i => ({
      dish_id: i.dish_id,
      dish_name: i.dish_name,
      qty: i.qty,
    }));
  }

  return json(orders);
}

// ============ 合并接口 ============

async function getAll() {
  const today = new Date().toISOString().slice(0, 10);
  const [cats, dishRes, todayRes] = await Promise.all([
    db.collection('categories').orderBy('sort_order', 'asc').orderBy('id', 'asc').get(),
    db.collection('dishes').orderBy('id', 'asc').get(),
    db.collection('today_list').where({ date: today }).get(),
  ]);

  // 为今日安排关联菜品和分类信息
  const todayData = [];
  for (const t of todayRes.data) {
    const dish = await db.collection('dishes').where({ id: t.dish_id }).get();
    if (dish.data.length > 0) {
      const d = dish.data[0];
      const cat = await db.collection('categories').where({ id: d.category_id }).get();
      todayData.push({
        id: t.id,
        dish_id: t.dish_id,
        name: d.name,
        image: d.image,
        category_id: d.category_id,
        category: cat.data.length > 0 ? cat.data[0].name : '',
        sales: d.sales,
      });
    }
  }

  return json({
    categories: cats.data,
    dishes: dishRes.data,
    today: todayData,
  });
}

// ============ 今日安排 ============

async function getToday() {
  const today = new Date().toISOString().slice(0, 10);
  const res = await db.collection('today_list').where({ date: today }).orderBy('id', 'asc').get();

  const data = [];
  for (const t of res.data) {
    const dish = await db.collection('dishes').where({ id: t.dish_id }).get();
    if (dish.data.length > 0) {
      const d = dish.data[0];
      const cat = await db.collection('categories').where({ id: d.category_id }).get();
      data.push({
        id: t.id,
        dish_id: t.dish_id,
        name: d.name,
        image: d.image,
        category_id: d.category_id,
        category: cat.data.length > 0 ? cat.data[0].name : '',
        sales: d.sales,
      });
    }
  }

  return json(data);
}

async function removeToday(dishId) {
  const today = new Date().toISOString().slice(0, 10);
  await db.collection('today_list').where({ dish_id: dishId, date: today }).remove();
  return json({ success: true });
}

// ============ 认证 ============

async function authCheck(body) {
  const { password } = body;
  if (password === process.env.ADMIN_PASSWORD) {
    return json({ token: process.env.ADMIN_PASSWORD });
  }
  return error('密码错误', 401);
}

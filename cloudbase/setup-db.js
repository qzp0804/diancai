// CloudBase 数据库初始化脚本
// 使用方式：node setup-db.js
const cloudbase = require('@cloudbase/node-sdk');

const ENV_ID = 'allen-0804';

// 初始化（使用 CLI 已有的登录凭证）
const app = cloudbase.init({ env: ENV_ID });
const db = app.database();

async function main() {
  // 1. 确保集合存在（CloudBase 文档数据库在首次写入时会自动创建集合）
  
  // 2. 导入分类数据
  console.log('正在导入分类数据...');
  const categories = [
    { id: 1, name: '炒菜', sort_order: 1 },
    { id: 2, name: '炖菜', sort_order: 2 },
    { id: 3, name: '凉菜', sort_order: 3 },
    { id: 4, name: '主食', sort_order: 4 },
    { id: 5, name: '水果', sort_order: 5 },
    { id: 6, name: '酒水', sort_order: 6 },
    { id: 7, name: '外食', sort_order: 7 },
  ];
  
  for (const cat of categories) {
    try {
      await db.collection('categories').add(cat);
      console.log(`  ✓ 分类: ${cat.name}`);
    } catch (e) {
      console.log(`  分类 ${cat.name} 已存在: ${e.message}`);
    }
  }

  // 3. 导入菜品数据
  console.log('正在导入菜品数据...');
  const dishes = [
    { id: 1784196835735, name: '打卤面', category_id: 4, category: '主食', image: 'image/125f3340625b0d04e16c29cc6b4574f9.jpg', sales: 0, created_at: new Date().toISOString() },
    { id: 1784196835736, name: '尖叫土豆炒火腿肠', category_id: 1, category: '炒菜', image: 'image/183553848fbdbde0225638f573de620a.jpg', sales: 0, created_at: new Date().toISOString() },
    { id: 1784196835737, name: '大鹅炖粉条', category_id: 2, category: '炖菜', image: 'image/279ee8e30ac9c8043108b63c016a53d1.jpg', sales: 0, created_at: new Date().toISOString() },
    { id: 1784196835738, name: '麻辣豆腐', category_id: 2, category: '炖菜', image: 'image/2c1dcca33f9deb45fe25ec7d524bd7c7.png', sales: 0, created_at: new Date().toISOString() },
    { id: 1784196835740, name: '水煮/油焖大虾', category_id: 1, category: '炒菜', image: 'image/40131c4e2a6b9108e47e1e84bd8c3d7c.png', sales: 0, created_at: new Date().toISOString() },
    { id: 1784196835741, name: '凉拌土豆片', category_id: 3, category: '凉菜', image: 'image/4dd2fa49b52c4030cfc38be63f7a8b85.jpg', sales: 0, created_at: new Date().toISOString() },
    { id: 1784196835742, name: '胡萝卜炒肉', category_id: 1, category: '炒菜', image: 'image/542d4a8a6f15d6f1d17824e29d193370.jpg', sales: 0, created_at: new Date().toISOString() },
    { id: 1784196835743, name: '凉拌笋片', category_id: 3, category: '凉菜', image: 'image/6437d0ad97c4f94d55163e36036d9844.jpg', sales: 0, created_at: new Date().toISOString() },
    { id: 1784196835744, name: '鸡爪/鸡腿炖土豆', category_id: 2, category: '炖菜', image: 'image/7bc167b83ab189bc5e7c21b64fd18196.png', sales: 0, created_at: new Date().toISOString() },
    { id: 1784196835745, name: '小葱拌豆腐', category_id: 3, category: '凉菜', image: 'image/8d51cd9a52649c39bf02d0045e26d10d.jpg', sales: 0, created_at: new Date().toISOString() },
    { id: 1784196835746, name: '炒面', category_id: 4, category: '主食', image: 'image/8fe2d715b0a96741e07adf4dd80ea8db.jpg', sales: 0, created_at: new Date().toISOString() },
    { id: 1784196835747, name: '饺子', category_id: 4, category: '主食', image: 'image/af20258e78a90241523175a7fc803b91.jpg', sales: 0, created_at: new Date().toISOString() },
    { id: 1784196835748, name: '酸菜粉', category_id: 1, category: '炒菜', image: 'image/b113eb672b1f269a64a97b1ff85fc730.jpg', sales: 0, created_at: new Date().toISOString() },
    { id: 1784196835749, name: '黄金蛋炒饭', category_id: 4, category: '主食', image: 'image/b4032fe1383e1c4141051650bdaac961.jpg', sales: 0, created_at: new Date().toISOString() },
    { id: 1784196835750, name: '拍黄瓜', category_id: 3, category: '凉菜', image: 'image/c0eee6c2d061d7d65f4c02bd1b2cf5b4.jpg', sales: 0, created_at: new Date().toISOString() },
    { id: 1784196835751, name: '冷面', category_id: 4, category: '主食', image: 'image/ce98485e0e9185b0cb4ea180d301a5a5.jpg', sales: 0, created_at: new Date().toISOString() },
    { id: 1784196835752, name: '木耳拌黄瓜', category_id: 3, category: '凉菜', image: 'image/e66f9987cf1dfee0135f8dcfd8612522.png', sales: 0, created_at: new Date().toISOString() },
    { id: 1784196835753, name: '洋葱炒羊肉', category_id: 1, category: '炒菜', image: 'image/fc73dd145410f5b69e89cca70bc2402a.jpg', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210414474, name: '西瓜', category_id: 5, category: '水果', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210426027, name: '荔枝', category_id: 5, category: '水果', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210438391, name: '哈密瓜', category_id: 5, category: '水果', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210449540, name: '桃子', category_id: 5, category: '水果', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210464688, name: '红苹果', category_id: 6, category: '酒水', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210475039, name: '啤酒', category_id: 6, category: '酒水', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210484271, name: '果酒', category_id: 6, category: '酒水', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210497555, name: '矿泉水', category_id: 6, category: '酒水', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210508288, name: '奶茶', category_id: 6, category: '酒水', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210519088, name: '饮料', category_id: 6, category: '酒水', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210531888, name: '火锅', category_id: 7, category: '外食', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210540204, name: '烧烤', category_id: 7, category: '外食', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210553688, name: '烤肉', category_id: 7, category: '外食', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210561088, name: '江西菜', category_id: 7, category: '外食', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210567971, name: '东北菜', category_id: 7, category: '外食', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210574688, name: '江浙菜', category_id: 7, category: '外食', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210585022, name: '川菜', category_id: 7, category: '外食', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210591322, name: '米粉', category_id: 7, category: '外食', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210598489, name: '麻辣烫', category_id: 7, category: '外食', image: '', sales: 0, created_at: new Date().toISOString() },
    { id: 1784210609355, name: '面馆', category_id: 7, category: '外食', image: '', sales: 0, created_at: new Date().toISOString() },
  ];
  
  let count = 0;
  for (const dish of dishes) {
    try {
      await db.collection('dishes').add(dish);
      count++;
    } catch (e) {
      console.log(`  菜品 ${dish.name} 导入失败: ${e.message}`);
    }
  }
  console.log(`  ✓ 成功导入 ${count} 道菜品`);

  console.log('\n数据库初始化完成！');
  console.log(`  分类: ${categories.length} 条`);
  console.log(`  菜品: ${count} 条`);
  process.exit(0);
}

main().catch(e => {
  console.error('初始化失败:', e.message);
  process.exit(1);
});

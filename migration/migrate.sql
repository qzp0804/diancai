INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (1, '炒菜', 1);
INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (2, '炖菜', 2);
INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (3, '凉菜', 3);
INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (4, '主食', 4);
INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (5, '水果', 5);
INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (6, '酒水', 6);
INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (7, '外食', 7);

INSERT OR IGNORE INTO dishes (id, name, category_id, image) VALUES
(1784196835735, '打卤面', 4, 'image/125f3340625b0d04e16c29cc6b4574f9.jpg'),
(1784196835736, '尖叫土豆炒火腿肠', 1, 'image/183553848fbdbde0225638f573de620a.jpg'),
(1784196835737, '大鹅炖粉条', 2, 'image/279ee8e30ac9c8043108b63c016a53d1.jpg'),
(1784196835738, '麻辣豆腐', 2, 'image/2c1dcca33f9deb45fe25ec7d524bd7c7.png'),
(1784196835740, '水煮/油焖大虾', 1, 'image/40131c4e2a6b9108e47e1e84bd8c3d7c.png'),
(1784196835741, '凉拌土豆片', 3, 'image/4dd2fa49b52c4030cfc38be63f7a8b85.jpg'),
(1784196835742, '胡萝卜炒肉', 1, 'image/542d4a8a6f15d6f1d17824e29d193370.jpg'),
(1784196835743, '凉拌笋片', 3, 'image/6437d0ad97c4f94d55163e36036d9844.jpg'),
(1784196835744, '鸡爪/鸡腿炖土豆', 2, 'image/7bc167b83ab189bc5e7c21b64fd18196.png'),
(1784196835745, '小葱拌豆腐', 3, 'image/8d51cd9a52649c39bf02d0045e26d10d.jpg'),
(1784196835746, '炒面', 4, 'image/8fe2d715b0a96741e07adf4dd80ea8db.jpg'),
(1784196835747, '饺子', 4, 'image/af20258e78a90241523175a7fc803b91.jpg'),
(1784196835748, '酸菜粉', 1, 'image/b113eb672b1f269a64a97b1ff85fc730.jpg'),
(1784196835749, '黄金蛋炒饭', 4, 'image/b4032fe1383e1c4141051650bdaac961.jpg'),
(1784196835750, '拍黄瓜', 3, 'image/c0eee6c2d061d7d65f4c02bd1b2cf5b4.jpg'),
(1784196835751, '冷面', 4, 'image/ce98485e0e9185b0cb4ea180d301a5a5.jpg'),
(1784196835752, '木耳拌黄瓜', 3, 'image/e66f9987cf1dfee0135f8dcfd8612522.png'),
(1784196835753, '洋葱炒羊肉', 1, 'image/fc73dd145410f5b69e89cca70bc2402a.jpg'),
(1784210414474, '西瓜', 5, ''),
(1784210426027, '荔枝', 5, ''),
(1784210438391, '哈密瓜', 5, ''),
(1784210449540, '桃子', 5, ''),
(1784210464688, '红苹果', 6, ''),
(1784210475039, '啤酒', 6, ''),
(1784210484271, '果酒', 6, ''),
(1784210497555, '矿泉水', 6, ''),
(1784210508288, '奶茶', 6, ''),
(1784210519088, '饮料', 6, ''),
(1784210531888, '火锅', 7, ''),
(1784210540204, '烧烤', 7, ''),
(1784210553688, '烤肉', 7, ''),
(1784210561088, '江西菜', 7, ''),
(1784210567971, '东北菜', 7, ''),
(1784210574688, '江浙菜', 7, ''),
(1784210585022, '川菜', 7, ''),
(1784210591322, '米粉', 7, ''),
(1784210598489, '麻辣烫', 7, ''),
(1784210609355, '面馆', 7, '');

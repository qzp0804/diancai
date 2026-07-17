// 更新菜品图片路径为 CloudBase 托管完整 URL
const fs = require('fs');

const ENV = 'allen-0804-d9go2lxk541ca2e67';
const HOSTING_URL = 'https://allen-0804-d9go2lxk541ca2e67-1305658047.tcloudbaseapp.com';

// 读取菜品数据
const dishes = JSON.parse(fs.readFileSync('import-dishes.json', 'utf8'));

// 更新图片路径
for (const dish of dishes) {
  if (dish.image && dish.image.startsWith('image/')) {
    dish.image = `${HOSTING_URL}/${dish.image}`;
  }
}

// 生成更新命令
const cmd = JSON.stringify([{
  TableName: 'dishes',
  CommandType: 'UPDATE',
  Command: JSON.stringify({
    update: 'dishes',
    updates: dishes
      .filter(d => d.image && d.image.startsWith(HOSTING_URL))
      .map(d => ({
        q: { id: d.id },
        u: { $set: { image: d.image } },
      })),
  }),
}]);

fs.writeFileSync('cmd-update-images.json', cmd);
console.log('生成 cmd-update-images.json');
console.log('执行方式:');
console.log(`  cloudbase db nosql execute --env-id ${ENV} --command "$(cat cmd-update-images.json)"`);

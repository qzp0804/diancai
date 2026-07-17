// 更新菜品图片路径为完整 URL
const fs = require('fs');

const DOMAIN = 'https://allen-0804-d9go2lxk541ca2e67-1305658047.tcloudbaseapp.com';

// 读取菜品数据
const dishes = JSON.parse(fs.readFileSync('import-dishes.json', 'utf8'));

// 生成 update 命令
const updates = dishes.filter(d => d.image && !d.image.startsWith('http')).map(d => {
  const newImage = `${DOMAIN}/${d.image}`;
  return {
    q: { id: d.id },
    u: { $set: { image: newImage } }
  };
});

if (updates.length === 0) {
  console.log('没有需要更新的图片');
  process.exit(0);
}

// 分批写入
const BATCH_SIZE = 100;
for (let i = 0; i < updates.length; i += BATCH_SIZE) {
  const batch = updates.slice(i, i + BATCH_SIZE);
  const cmdObj = {
    update: 'dishes',
    updates: batch
  };
  // CLI 3.x 格式
  const cmd = [{
    TableName: 'dishes',
    CommandType: 'UPDATE',
    Command: JSON.stringify(cmdObj)
  }];
  fs.writeFileSync(`cmd-update-${i}.json`, JSON.stringify(cmd));
  console.log(`生成 cmd-update-${i}.json (${batch.length} 条)`);
}

console.log(`\n执行方式:`);
console.log(`  cloudbase db nosql execute --env-id allen-0804-d9go2lxk541ca2e67 --command "$(cat cmd-update-0.json)"`);

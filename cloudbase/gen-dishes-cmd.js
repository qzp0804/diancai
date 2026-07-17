// 生成 CloudBase CLI 3.x 格式的菜品导入命令
const fs = require('fs');

const DOMAIN = 'https://allen-0804-d9go2lxk541ca2e67-1305658047.tcloudbaseapp.com';

// 读取菜品数据
const dishes = JSON.parse(fs.readFileSync('import-dishes.json', 'utf8'));

// 转换图片路径为完整 URL
const processed = dishes.map(d => ({
  ...d,
  image: d.image ? `${DOMAIN}/${d.image}` : ''
}));

// 分批写入（每批最多 100）
const BATCH_SIZE = 100;
for (let i = 0; i < processed.length; i += BATCH_SIZE) {
  const batch = processed.slice(i, i + BATCH_SIZE);
  const cmdObj = {
    insert: 'dishes',
    documents: batch
  };
  // CLI 3.x 格式
  const cmd = [{
    TableName: 'dishes',
    CommandType: 'INSERT',
    Command: JSON.stringify(cmdObj)
  }];
  fs.writeFileSync(`cmd-dishes-${i}.json`, JSON.stringify(cmd));
  console.log(`生成 cmd-dishes-${i}.json (${batch.length} 条)`);
}

console.log(`\n执行方式:`);
console.log(`  cloudbase db nosql execute --env-id allen-0804-d9go2lxk541ca2e67 --command "$(cat cmd-dishes-0.json)"`);

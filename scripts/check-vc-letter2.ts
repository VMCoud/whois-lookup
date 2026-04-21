import { lookup } from 'whois';

const letters = 'abcdefghijklmnopqrstuvwxyz';

const available: string[] = [];
const taken: string[] = [];
let checked = 0;
const total = 676; // 26 * 26
const concurrency = 20;

console.log('开始查询 vc 后缀 2 字符域名 (字母+字母)...\n');

function checkDomain(domain: string): Promise<boolean> {
  return new Promise((resolve) => {
    lookup(domain, { follow: 1, timeout: 4000 }, (err: Error | null, data: string) => {
      if (err) {
        resolve(false);
      } else {
        const lowerData = data.toLowerCase();
        const isAvailable = lowerData.includes('not found') || 
                           lowerData.includes('no match') ||
                           lowerData.includes('no entries') ||
                           (lowerData.includes('domain') && lowerData.includes('not'));
        resolve(isAvailable);
      }
    });
  });
}

async function run() {
  const domains: string[] = [];
  
  for (const letter1 of letters) {
    for (const letter2 of letters) {
      domains.push(`${letter1}${letter2}.vc`);
    }
  }

  async function processBatch(batch: string[]): Promise<{available: string[], taken: string[]}> {
    const results = await Promise.all(batch.map(async (domain) => {
      const isAvailable = await checkDomain(domain);
      process.stdout.write(`\r进度: ${++checked}/${total}`);
      return { domain, isAvailable };
    }));

    return {
      available: results.filter(r => r.isAvailable).map(r => r.domain),
      taken: results.filter(r => !r.isAvailable).map(r => r.domain)
    };
  }

  // 分批处理
  for (let i = 0; i < domains.length; i += concurrency) {
    const batch = domains.slice(i, i + concurrency);
    const result = await processBatch(batch);
    available.push(...result.available);
    taken.push(...result.taken);
  }

  console.log('\n\n========== 查询结果 ==========\n');
  console.log(`总查询: ${total} 个`);
  console.log(`已注册: ${taken.length} 个`);
  console.log(`可注册: ${available.length} 个\n`);
  
  if (available.length > 0) {
    console.log('✅ 可注册的域名:');
    // 每行 10 个
    for (let i = 0; i < available.length; i += 10) {
      console.log(available.slice(i, i + 10).join(', '));
    }
  } else {
    console.log('❌ 没有发现可注册的域名');
  }
  
  console.log('\n已注册的域名:');
  for (let i = 0; i < taken.length; i += 10) {
    console.log(taken.slice(i, i + 10).join(', '));
  }
  
  // 保存结果
  const fs = await import('fs');
  fs.writeFileSync('/tmp/vc-letter2-result.txt', `
========== 查询结果 ==========
总查询: ${total} 个
已注册: ${taken.length} 个
可注册: ${available.length} 个

可注册的域名:
${available.join(', ')}

已注册的域名:
${taken.join(', ')}
  `);
  console.log('\n结果已保存到 /tmp/vc-letter2-result.txt');
}

run().catch(console.error);

import { lookup } from 'whois';

const letters = 'abcdefghijklmnopqrstuvwxyz';
const digits = '0123456789';

const available: string[] = [];
const taken: string[] = [];
let checked = 0;
const total = 260;
const concurrency = 15;

console.log('开始查询 vc 后缀 2 字符域名 (数字+字母)...\n');

function checkDomain(domain: string): Promise<boolean> {
  return new Promise((resolve) => {
    lookup(domain, { follow: 1, timeout: 4000 }, (err: Error | null, data: string) => {
      if (err) {
        resolve(false);
      } else {
        const lowerData = data.toLowerCase();
        const isAvailable = lowerData.includes('no match') || 
                           lowerData.includes('not found') ||
                           lowerData.includes('no entries found');
        resolve(isAvailable);
      }
    });
  });
}

async function run() {
  const domains: string[] = [];
  
  for (const digit of digits) {
    for (const letter of letters) {
      domains.push(`${digit}${letter}.vc`);
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
    console.log(available.join(', '));
  } else {
    console.log('❌ 没有发现可注册的域名');
  }
}

run().catch(console.error);

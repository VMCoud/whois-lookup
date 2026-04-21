import { lookup } from 'whois';

const letters = 'abcdefghijklmnopqrstuvwxyz';
const digits = '0123456789';

const available: string[] = [];
const concurrency = 30;

function checkDomain(domain: string): Promise<boolean> {
  return new Promise((resolve) => {
    lookup(domain, { follow: 1, timeout: 3000 }, (err: Error | null, data: string) => {
      if (err) {
        resolve(false);
      } else {
        const lowerData = data.toLowerCase();
        const isAvailable = lowerData.includes('not found') || 
                           lowerData.includes('no match') ||
                           lowerData.includes('no entries');
        resolve(isAvailable);
      }
    });
  });
}

async function run() {
  const total = 6760 + 6760; // digit2letter + letter2digit
  console.log(`查询双字母+数字和数字+双字母格式: ${total} 个\n`);
  
  // 1. 数字+双字母 (0ab.vc)
  const digit2letter: string[] = [];
  for (const d of digits) {
    for (const l1 of letters) {
      for (const l2 of letters) {
        digit2letter.push(`${d}${l1}${l2}.vc`);
      }
    }
  }
  
  // 2. 双字母+数字 (ab0.vc)
  const letter2digit: string[] = [];
  for (const l1 of letters) {
    for (const l2 of letters) {
      for (const d of digits) {
        letter2digit.push(`${l1}${l2}${d}.vc`);
      }
    }
  }
  
  const all = [...digit2letter, ...letter2digit];
  let checked = 0;
  let found = 0;
  
  for (let i = 0; i < all.length; i += concurrency) {
    const batch = all.slice(i, i + concurrency);
    const results = await Promise.all(batch.map(async (domain) => {
      checked++;
      const isAvailable = await checkDomain(domain);
      return isAvailable ? domain : null;
    }));
    
    const batchFound = results.filter(r => r !== null) as string[];
    if (batchFound.length > 0) {
      found += batchFound.length;
      available.push(...batchFound);
      console.log(`\n[${checked}/${total}] 找到 ${batchFound.length} 个可注册!`);
      batchFound.forEach(d => console.log(`  - ${d}`));
    } else if (checked % 500 === 0) {
      process.stdout.write(`\r进度: ${checked}/${total}, 已找到: ${found}`);
    }
  }
  
  console.log('\n\n========== 查询完成 ==========');
  console.log(`可注册总数: ${available.length} 个\n`);
  
  if (available.length > 0) {
    console.log('全部可注册域名:');
    console.log(available.join(', '));
  }
  
  const fs = await import('fs');
  fs.writeFileSync('/tmp/vc-3char.txt', available.join('\n'));
}

run().catch(console.error);

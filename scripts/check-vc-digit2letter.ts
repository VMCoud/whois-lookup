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
  // 数字+双字母 (0ab.vc - 6760个)
  const digit2letter: string[] = [];
  for (const d of digits) {
    for (const l1 of letters) {
      for (const l2 of letters) {
        digit2letter.push(`${d}${l1}${l2}.vc`);
      }
    }
  }
  
  console.log(`查询数字+双字母格式: ${digit2letter.length} 个`);
  let checked = 0;
  
  for (let i = 0; i < digit2letter.length; i += concurrency) {
    const batch = digit2letter.slice(i, i + concurrency);
    const results = await Promise.all(batch.map(async (domain) => {
      checked++;
      if (checked % 500 === 0) {
        process.stdout.write(`\r进度: ${checked}/${digit2letter.length}`);
      }
      const isAvailable = await checkDomain(domain);
      return isAvailable ? domain : null;
    }));
    
    const found = results.filter(r => r !== null);
    if (found.length > 0) {
      console.log(`\n找到 ${found.length} 个可注册: ${found.join(', ')}`);
      available.push(...found);
    }
  }
  
  console.log('\n\n========== 数字+双字母 查询完成 ==========');
  console.log(`可注册总数: ${available.length} 个`);
  console.log(available.join(', '));
  
  const fs = await import('fs');
  fs.writeFileSync('/tmp/vc-digit2letter.txt', available.join('\n'));
}

run().catch(console.error);

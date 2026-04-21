import { lookup } from 'whois';

const letters = 'abcdefghijklmnopqrstuvwxyz';
const digits = '0123456789';

const available: string[] = [];
let checked = 0;
let total = 0;
const concurrency = 25;

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
                           lowerData.includes('domain not found') ||
                           lowerData.includes('domainquery') && lowerData.includes('not found');
        resolve(isAvailable);
      }
    });
  });
}

async function queryDomains(domains: string[], name: string) {
  console.log(`\n开始查询: ${name} (${domains.length} 个)`);
  const results: string[] = [];
  
  for (let i = 0; i < domains.length; i += concurrency) {
    const batch = domains.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(async (domain) => {
      checked++;
      process.stdout.write(`\r总进度: ${checked}/${total}`);
      const isAvailable = await checkDomain(domain);
      return isAvailable ? domain : null;
    }));
    results.push(...batchResults.filter(r => r !== null) as string[]);
  }
  
  return results;
}

async function run() {
  // 生成所有查询组合
  const domains: { name: string; list: string[] }[] = [];
  
  // 1. 字母+数字 (a1.vc, b2.vc ... z9.vc) - 26*10 = 260
  const letterDigit: string[] = [];
  for (const l of letters) {
    for (const d of digits) {
      letterDigit.push(`${l}${d}.vc`);
    }
  }
  domains.push({ name: '字母+数字 (x0.xc)', list: letterDigit });
  
  // 2. 数字+两位字母 (0ab.vc, 1cd.vc ...) - 10*676 = 6760
  const digit2letter: string[] = [];
  for (const d of digits) {
    for (const l1 of letters) {
      for (const l2 of letters) {
        digit2letter.push(`${d}${l1}${l2}.vc`);
      }
    }
  }
  domains.push({ name: '数字+双字母 (0ab.xc)', list: digit2letter });
  
  // 3. 两位字母+数字 (ab0.vc, cd1.vc ...) - 676*10 = 6760
  const letter2digit: string[] = [];
  for (const l1 of letters) {
    for (const l2 of letters) {
      for (const d of digits) {
        letter2digit.push(`${l1}${l2}${d}.vc`);
      }
    }
  }
  domains.push({ name: '双字母+数字 (ab0.xc)', list: letter2digit });
  
  // 计算总数
  total = domains.reduce((sum, d) => sum + d.list.length, 0);
  console.log(`总共需要查询 ${total} 个域名\n`);
  
  // 执行查询
  for (const { name, list } of domains) {
    const results = await queryDomains(list, name);
    if (results.length > 0) {
      console.log(`\n✅ ${name} 可注册 (${results.length} 个):`);
      console.log(results.slice(0, 50).join(', '));
      if (results.length > 50) {
        console.log(`... 还有 ${results.length - 50} 个`);
      }
      available.push(...results);
    } else {
      console.log(`\n❌ ${name} 无可注册域名`);
    }
  }
  
  console.log('\n\n========== 最终结果 ==========');
  console.log(`总共查询: ${total} 个`);
  console.log(`可注册总数: ${available.length} 个\n`);
  
  if (available.length > 0) {
    console.log('✅ 全部可注册域名:');
    for (let i = 0; i < available.length; i += 20) {
      console.log(available.slice(i, i + 20).join(', '));
    }
  }
  
  // 保存
  const fs = await import('fs');
  fs.writeFileSync('/tmp/vc-all-available.txt', available.join('\n'));
  console.log('\n结果已保存到 /tmp/vc-all-available.txt');
}

run().catch(console.error);

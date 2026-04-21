import { Router, Request, Response } from 'express';
import { lookup as whoisLookup } from 'whois';
import { optionalApiKeyAuth } from '../middleware/auth';

const router = Router();

// 应用可选的 API Key 认证（用于追踪使用情况）
router.use(optionalApiKeyAuth);

interface WhoisParams {
  domain: string;
}

interface WhoisQuery {
  domain?: string;
  server?: string;
  follow?: number;
  timeout?: number;
  port?: number;
}

/**
 * WHOIS 查询 API
 * GET /api/whois?domain=example.com
 * POST /api/whois { "domain": "example.com" }
 */
router.get('/api/whois', async (req: Request<object, object, object, WhoisParams>, res: Response) => {
  const { domain } = req.query;

  if (!domain) {
    res.status(400).json({
      success: false,
      error: 'Domain parameter is required',
    });
    return;
  }

  await performWhoisQuery(domain, res);
});

router.post('/api/whois', async (req: Request, res: Response) => {
  const { domain, server, follow, timeout, port } = req.body as WhoisQuery;

  if (!domain) {
    res.status(400).json({
      success: false,
      error: 'Domain parameter is required',
    });
    return;
  }

  const options: Record<string, unknown> = {};
  if (server) options.server = server;
  if (follow !== undefined) options.follow = follow;
  if (timeout !== undefined) options.timeout = timeout;
  if (port !== undefined) options.port = port;

  await performWhoisQuery(domain, res, options);
});

/**
 * 执行 WHOIS 查询并返回结果
 */
async function performWhoisQuery(
  domain: string,
  res: Response,
  options: Record<string, unknown> = {}
): Promise<void> {
  // 清理域名格式
  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  // 验证域名格式
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(cleanDomain) && !cleanDomain.includes('.')) {
    res.status(400).json({
      success: false,
      error: 'Invalid domain format',
      domain: cleanDomain,
    });
    return;
  }

  // 获取 TLD 特定的 WHOIS 服务器
  const tldServer = getWhoisServer(cleanDomain);
  if (tldServer) {
    options.server = tldServer;
  }

  try {
    const result = await queryWhois(cleanDomain, options);
    res.json({
      success: true,
      domain: cleanDomain,
      raw: result,
      parsed: parseWhoisText(result),
      queriedAt: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`WHOIS query failed for ${cleanDomain}:`, errorMessage);
    res.status(500).json({
      success: false,
      domain: cleanDomain,
      error: errorMessage,
    });
  }
}

/**
 * 获取特定 TLD 的 WHOIS 服务器
 */
function getWhoisServer(domain: string): string | null {
  const tld = domain.split('.').pop()?.toLowerCase();
  
  // 常见 TLD 的 WHOIS 服务器映射
  const whoisServers: Record<string, string> = {
    // 中国域名
    'cn': 'whois.cnnic.cn',
    'com.cn': 'whois.cnnic.cn',
    'net.cn': 'whois.cnnic.cn',
    'org.cn': 'whois.cnnic.cn',
    'gov.cn': 'whois.cnnic.cn',
    'ac.cn': 'whois.cnnic.cn',
    'bj.cn': 'whois.cnnic.cn',
    'sh.cn': 'whois.cnnic.cn',
    'tj.cn': 'whois.cnnic.cn',
    'cq.cn': 'whois.cnnic.cn',
    
    // 国际通用域名
    'top': 'whois.nic.top',
    'vip': 'whois.nic.vip',
    'shop': 'whois.nic.shop',
    'store': 'whois.nic.store',
    'site': 'whois.nic.site',
    'online': 'whois.nic.online',
    'fun': 'whois.nic.fun',
    'xyz': 'whois.nic.xyz',
    'club': 'whois.nic.club',
    'io': 'whois.nic.io',
    'co': 'whois.nic.co',
    'me': 'whois.nic.me',
    'cc': 'whois.nic.cc',
    'tv': 'whois.nic.tv',
    'biz': 'whois.biz',
    'info': 'whois.afilias.info',
    'mobi': 'whois.dotmobiregistry.net',
    'asia': 'whois.nic.asia',
    'tel': 'whois.nic.tel',
    'pro': 'whois.nic.pro',
    'app': 'whois.nic.google',
    'dev': 'whois.nic.google',
    'cloud': 'whois.nic.cloud',
  };

  return tld ? (whoisServers[tld] || null) : null;
}

/**
 * WHOIS 查询超时时间（毫秒）
 */
const WHOIS_TIMEOUT = 15000; // 15秒

/**
 * 执行 WHOIS 查询
 */
function queryWhois(domain: string, options: Record<string, unknown>): Promise<string> {
  return new Promise((resolve, reject) => {
    // 设置超时
    const timeout = setTimeout(() => {
      reject(new Error(`WHOIS 查询超时（${WHOIS_TIMEOUT / 1000}秒），服务器可能无响应或域名不存在`));
    }, WHOIS_TIMEOUT);

    whoisLookup(domain, options, (err: Error | null, data: string) => {
      clearTimeout(timeout);
      if (err) {
        // 统一提取错误信息（兼容 Error 对象和普通对象）
        const errorMsg = err.message || (err as Record<string, unknown>).code as string || String(err);
        
        // 检查是否包含常见错误
        if (errorMsg.includes('timeout') || errorMsg.includes('ETIMEDOUT') || errorMsg.includes('ENOTFOUND') || errorMsg.includes('EAI_AGAIN')) {
          reject(new Error(`WHOIS 服务器连接超时，请稍后重试`));
        } else if (errorMsg.includes('ECONNREFUSED')) {
          reject(new Error(`WHOIS 服务器连接被拒绝`));
        } else if (!errorMsg.trim()) {
          reject(new Error(`WHOIS 查询失败，请稍后重试`));
        } else {
          reject(new Error(`WHOIS 查询失败: ${errorMsg}`));
        }
      } else if (!data || data.trim() === '') {
        reject(new Error(`未获取到 WHOIS 数据，域名可能不存在`));
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * 解析 WHOIS 文本，提取关键信息
 */
function parseWhoisText(text: string): Record<string, string | string[]> {
  const parsed: Record<string, string | string[]> = {};
  // 处理 \r\n (Windows) 和 \n (Unix) 换行符
  const lines = text.split(/\r?\n/);

  // 字段名映射表（原始字段名 → 标准化字段名）
  const fieldMapping: Record<string, string> = {
    'registrant': 'registrant_name',
    'registrant_name': 'registrant_name',
    'registrant_organization': 'registrant_organization',
    'registrant_country': 'registrant_country',
    'registrant_contact_email': 'registrant_email',
    'admin': 'admin_name',
    'admin_name': 'admin_name',
    'admin_contact_email': 'admin_email',
    'tech': 'tech_name',
    'tech_name': 'tech_name',
    'tech_contact_email': 'tech_email',
    'billing': 'billing_name',
    'billing_contact_email': 'billing_email',
    'domain_name': 'domain_name',
    'roid': 'roid',
    'domain_status': 'domain_status',
    'registrar': 'registrar',
    'sponsoring_registrar': 'registrar',
    'name_server': 'name_server',
    'nameserver': 'name_server',
    'registration_time': 'creation_date',
    'created_date': 'creation_date',
    'creation_date': 'creation_date',
    'expiration_time': 'expiration_date',
    'expiry_date': 'expiration_date',
    'expiration_date': 'expiration_date',
    'registrar_registration_expiration_date': 'expiration_date',
    'updated_date': 'updated_date',
    'dnssec': 'dnssec',
    'registrar_whois_server': 'registrar_whois_server',
    'registrar_url': 'registrar_url',
    'registry_domain_id': 'registry_domain_id',
    'registrar_iana_id': 'registrar_iana_id',
    'registrar_abuse_contact_email': 'registrar_abuse_email',
    'registrar_abuse_contact_phone': 'registrar_abuse_phone',
    'registry_registrant_id': 'registry_registrant_id',
    'registrant_stateprovince': 'registrant_state',
    'registrant_country': 'registrant_country',
    'registrant_email': 'registrant_email',
  };

  for (const line of lines) {
    // 清理行末的 \r 并跳过空行和分隔线
    const cleanLine = line.trim().replace(/\r$/, '');
    if (!cleanLine) {
      continue;
    }

    // 跳过特殊行
    if (cleanLine.startsWith('=') || cleanLine.startsWith('%') || cleanLine.startsWith('>>>')) {
      continue;
    }

    // 跳过免责声明段落（包含特定关键词的行）
    const lowerLine = cleanLine.toLowerCase();
    if (lowerLine.startsWith('for more information') || 
        lowerLine.startsWith('important reminder') ||
        lowerLine.startsWith('if you wish to contact') ||
        lowerLine.startsWith('if you have a legitimate interest') ||
        lowerLine.startsWith('the data in') ||
        lowerLine.startsWith('web-based whois') ||
        lowerLine.startsWith('pursuant') ||
        lowerLine.startsWith('we will review') ||
        lowerLine.startsWith('to verify that you are not') ||
        lowerLine.startsWith('lawful purposes') ||
        lowerLine.startsWith('pursuant to') ||
        lowerLine.startsWith('if you wish') ||
        lowerLine.match(/^\d+\.\s/)) {  // 跳过编号列表（如 "1. xxx"）
      continue;
    }

    // 跳过超长的行（通常是免责声明文本）
    if (cleanLine.length > 300) {
      continue;
    }

    // 跳过以 URL 形式开始的行（不是有冒号的键值对）
    if (cleanLine.startsWith('http://') || cleanLine.startsWith('https://') || cleanLine.startsWith('www.')) {
      continue;
    }

    // 匹配 Key: Value 格式
    const match = cleanLine.match(/^([^\s:]+(?:\s+[^\s:]+)*):\s*(.*)$/);
    if (match) {
      const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
      const value = match[2].trim();

      // 跳过 URL 类型的值（通常是隐私保护跳转到网页）
      if (value.startsWith('http://') || 
          value.startsWith('https://') || 
          value.startsWith('www.') ||
          value.startsWith('//')) {
        // 保留域名相关的 URL，跳过其他的
        if (!['registrar_whois_server', 'registrar_url'].includes(key)) {
          continue;
        }
      }

      // 应用字段名映射
      const mappedKey = fieldMapping[key] || key;

      // 跳过通用联系方式（但保留特定实体的联系方式）
      // 只跳过顶级的 phone/fax，不跳过 registrant_contact_email 等
      if (['phone', 'fax'].includes(mappedKey) || 
          (mappedKey === 'e-mail' || mappedKey === 'email')) {
        // 这些是通用的联系方式，跳过
        continue;
      }

      // 如果已有相同 key，转换为数组
      if (parsed[mappedKey] !== undefined) {
        if (Array.isArray(parsed[mappedKey])) {
          (parsed[mappedKey] as string[]).push(value);
        } else {
          parsed[mappedKey] = [parsed[mappedKey] as string, value];
        }
      } else {
        parsed[mappedKey] = value;
      }
    }
  }

  return parsed;
}

export default router;

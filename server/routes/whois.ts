import { Router, Request, Response } from 'express';
import { lookup as whoisLookup } from 'whois';

const router = Router();

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
router.get('/api/whois', async (req: Request<{}, {}, {}, WhoisParams>, res: Response) => {
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
 * 执行 WHOIS 查询
 */
function queryWhois(domain: string, options: Record<string, unknown>): Promise<string> {
  return new Promise((resolve, reject) => {
    whoisLookup(domain, options, (err: Error | null, data: string) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * 解析 WHOIS 文本，提取关键信息
 */
function parseWhoisText(text: string): Record<string, string> {
  const parsed: Record<string, string> = {};
  const lines = text.split('\n');

  for (const line of lines) {
    // 跳过空行和分隔线
    if (!line.trim() || line.startsWith('=') || line.startsWith('%')) {
      continue;
    }

    // 匹配 Key: Value 格式
    const match = line.match(/^([^\s:]+(?:\s+[^\s:]+)*):\s*(.*)$/);
    if (match) {
      const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
      const value = match[2].trim();

      // 如果已有相同 key，转换为数组
      if (parsed[key] !== undefined) {
        if (Array.isArray(parsed[key])) {
          (parsed[key] as string[]).push(value);
        } else {
          parsed[key] = [parsed[key] as string, value];
        }
      } else {
        parsed[key] = value;
      }
    }
  }

  return parsed;
}

export default router;

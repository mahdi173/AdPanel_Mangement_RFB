import type { Request } from 'express';

export type RequestAuthContext = {
  ipAddress?: string;
  userAgent?: string;
  deviceId: string;
};

function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `dev_${Math.abs(hash)}`;
}

export function buildRequestAuthContext(req: Request): RequestAuthContext {
  const userAgent = req.headers['user-agent'];
  const ua = typeof userAgent === 'string' ? userAgent : undefined;
  const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string | undefined);
  const deviceHeader = req.headers['x-device-id'];
  const providedDeviceId = typeof deviceHeader === 'string' ? deviceHeader : undefined;

  return {
    ipAddress,
    userAgent: ua,
    deviceId: providedDeviceId || hashString(`${ua || 'unknown'}|${ipAddress || 'unknown'}`),
  };
}


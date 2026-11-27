const crypto = require('crypto');
const { Cashfree, CFEnvironment } = require('cashfree-pg');

let cashfreeInstance = null;
let cachedConfigKey = '';

const PLACEHOLDER_TOKENS = ['your_cashfree', 'your_key', 'replace_me', 'changeme'];

const isPlaceholder = (val) => {
  if (!val || typeof val !== 'string') return true;
  const lower = val.trim().toLowerCase();
  return !lower || PLACEHOLDER_TOKENS.some((token) => lower.includes(token));
};

const getCashfreeCredentials = () => {
  const appId = (process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || '').trim();
  const secretKey = (process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET || '').trim();
  return { appId, secretKey };
};

const getCashfreeMode = () => {
  const explicitEnv = (process.env.CASHFREE_ENV || '').trim().toLowerCase();
  if (explicitEnv === 'sandbox' || explicitEnv === 'test') return 'sandbox';
  if (explicitEnv === 'production' || explicitEnv === 'prod' || explicitEnv === 'live') return 'production';

  const { appId } = getCashfreeCredentials();
  if (appId.toUpperCase().startsWith('TEST')) return 'sandbox';

  return process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';
};

const getCashfreeInstance = () => {
  const { appId, secretKey } = getCashfreeCredentials();
  if (isPlaceholder(appId) || isPlaceholder(secretKey)) {
    return null;
  }

  const mode = getCashfreeMode();
  const cfEnv = mode === 'production' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
  const configKey = `${mode}:${appId}:${secretKey}`;

  if (!cashfreeInstance || cachedConfigKey !== configKey) {
    cashfreeInstance = new Cashfree(cfEnv, appId, secretKey);
    cachedConfigKey = configKey;
  }

  return cashfreeInstance;
};

const verifyCashfreeWebhookSignature = (signature, rawBody, timestamp) => {
  const { secretKey } = getCashfreeCredentials();
  const webhookSecret = (process.env.CASHFREE_WEBHOOK_SECRET || secretKey || '').trim();

  if (!webhookSecret || !signature || !rawBody || !timestamp) {
    return false;
  }

  const bodyString = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody);
  const signedPayload = `${timestamp}${bodyString}`;

  const generated = crypto
    .createHmac('sha256', webhookSecret)
    .update(signedPayload)
    .digest('base64');

  const genBuf = Buffer.from(generated, 'utf8');
  const sigBuf = Buffer.from(String(signature).trim(), 'utf8');

  if (genBuf.length !== sigBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(genBuf, sigBuf);
};

module.exports = {
  getCashfreeInstance,
  getCashfreeMode,
  getCashfreeCredentials,
  verifyCashfreeWebhookSignature,
};

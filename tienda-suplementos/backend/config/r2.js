const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET || 'international-nutrition';
const R2_ENDPOINT = process.env.R2_ENDPOINT || (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined);
const R2_PUBLIC_BASE = process.env.R2_PUBLIC_BASE || 'https://pub-6737b83783eb40a5b8ef162f94b4e30c.r2.dev';
const R2_DEFAULT_PREFIX = process.env.R2_PREFIX || 'suplementos';

const hasR2Config = Boolean(R2_ENDPOINT && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET);

const r2Client = hasR2Config
  ? new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    })
  : null;

const sanitizeFileName = (filename = '') => {
  const base = path.basename(filename).replace(/[^a-zA-Z0-9.-]/g, '-');
  return base || `file-${Date.now()}`;
};

const buildKey = (folder, filename) => {
  const safeFolder = folder ? folder.replace(/\/+$/, '') : R2_DEFAULT_PREFIX;
  const safeName = sanitizeFileName(filename);
  return `${safeFolder}/${Date.now()}-${Math.random().toString(16).slice(2)}-${safeName}`;
};

const uploadBufferToR2 = async ({ buffer, contentType, folder = R2_DEFAULT_PREFIX, originalName }) => {
  if (!hasR2Config || !r2Client) {
    throw new Error('Cloudflare R2 no está configurado: define R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET y R2_ENDPOINT');
  }

  const key = buildKey(folder, originalName);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  const base = R2_PUBLIC_BASE.replace(/\/$/, '');
  return `${base}/${key}`;
};

module.exports = {
  uploadBufferToR2,
  hasR2Config,
  R2_PUBLIC_BASE,
  R2_DEFAULT_PREFIX,
};

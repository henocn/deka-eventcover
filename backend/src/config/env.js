const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const corsOrigins = [
  process.env.PUBLIC_APP_URL || 'http://localhost:5173',
  process.env.BACKOFFICE_APP_URL || 'http://localhost:5174',
].filter(Boolean);

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 4000),
  corsOrigins,
  mediaRoot: process.env.MEDIA_ROOT || 'uploads',
  maxUploadMb: toNumber(process.env.MAX_UPLOAD_MB, 25),
};

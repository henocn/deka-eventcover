const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');
const { sequelize } = require('../models');

const router = express.Router();

// Verifie l'API, PostgreSQL et le microservice facial.
router.get('/', asyncHandler(async (req, res) => {
  const checks = {
    api: 'ok',
    database: 'unknown',
    faceService: 'unknown',
  };
  let status = 'ok';

  try {
    await sequelize.authenticate();
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
    status = 'degraded';
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(new URL('/health', env.faceServiceUrl), {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    checks.faceService = response.ok ? 'ok' : 'error';
    if (!response.ok) status = 'degraded';
  } catch {
    checks.faceService = 'error';
    status = 'degraded';
  }

  res.status(status === 'ok' ? 200 : 503).json({
    status,
    service: 'deka-eventcover-api',
    checks,
  });
}));

module.exports = router;

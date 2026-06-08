const express = require('express');

const router = express.Router();

router.get('/overview', (req, res) => {
  res.json({
    message: 'Back-office API ready',
  });
});

module.exports = router;

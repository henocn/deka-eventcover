const express = require('express');

const router = express.Router();

router.get('/events/:slug', (req, res) => {
  res.json({
    slug: req.params.slug,
    message: 'Public event endpoint ready',
  });
});

module.exports = router;

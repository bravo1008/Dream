const express = require('express');
const router = express.Router();

router.get('/generate', (req, res) => {
  const { prompt, theme, style } = req.query;
  if (!prompt) {
    return res.status(400).json({ error: '请输入梦境描述' });
  }

  const mockImages = [
    'https://picsum.photos/id/1/800/600',
    'https://picsum.photos/id/2/800/600',
    'https://picsum.photos/id/3/800/600',
    'https://picsum.photos/id/4/800/600',
  ];

  const imageUrl = mockImages[Math.floor(Math.random() * mockImages.length)];

  res.json({
    image: imageUrl,
    prompt,
    theme,
    style,
  });
});

module.exports = router;
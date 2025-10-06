// backend/routes/news.js
const express = require('express');
const router = express.Router();

// Simple static news list. You can change this or move to DB later.
const news = [
  { id: 1, title: 'Mid Term Exam', link: '#' },
  { id: 2, title: 'Placement drive: 50 companies to visit campus next month', link: '#' }
];

router.get('/', (req, res) => {
  res.json(news);
});

module.exports = router;

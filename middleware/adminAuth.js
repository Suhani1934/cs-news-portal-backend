// backend/middleware/adminAuth.js
module.exports = function(req, res, next) {
  const headerKey = req.headers['x-admin-key'] || req.query.key || req.body.adminKey;
  if (!headerKey || headerKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ message: 'Unauthorized: invalid admin key' });
  }
  next();
};

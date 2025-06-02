const crypto = require('crypto');
const fs = require('fs');

module.exports = function(req, res, next) {
  if (!req.file) return next();
  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    req.imageHash = hash;
    next();
  } catch (err) {
    next(err);
  }
};

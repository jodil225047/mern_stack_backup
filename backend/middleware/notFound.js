const { failure } = require('../utils/response');
module.exports = (req, res) => failure(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);

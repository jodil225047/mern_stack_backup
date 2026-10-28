function success(res, status, message, data) {
  return res.status(status).json({ success: true, message, data });
}
function failure(res, status, message, data = null) {
  return res.status(status).json({ success: false, message, data });
}
module.exports = { success, failure };

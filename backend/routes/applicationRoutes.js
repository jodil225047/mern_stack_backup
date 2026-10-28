const express = require('express');
const controller = require('../controllers/applicationController');
const router = express.Router();
router.route('/').get(controller.listApplications).post(controller.createApplication);
router.route('/:id').get(controller.getApplication).put(controller.updateApplication).delete(controller.deleteApplication);
router.patch('/:id/status', controller.updateStatus);
module.exports = router;

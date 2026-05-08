const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin, getDashboardStats, getAllUsers, deleteUser, getHospitals, approveHospital, getAuditLogs, getCompletedTransplants } = require('../controllers/adminController');

router.use(protect);
router.use(requireAdmin);

router.get('/dashboard-stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/user/:user_id', deleteUser);
router.get('/hospitals', getHospitals);
router.post('/approve-hospital/:hospital_id', approveHospital);
router.get('/audit-logs', getAuditLogs);
router.get('/completed-transplants', getCompletedTransplants);

module.exports = router;

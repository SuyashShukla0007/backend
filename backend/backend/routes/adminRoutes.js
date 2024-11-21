// src/routes/adminRoutes.js
const express = require('express');
const { registerAdmin, loginAdmin, getAllStudents, getAllProfessors, assignElectives,clearSubjectsForAllStudents, getstudents} = require('../controllers/adminController.js');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/students', authMiddleware, adminMiddleware, getAllStudents);
router.get('/professors', authMiddleware, adminMiddleware, getAllProfessors);
router.post('/electives', authMiddleware, adminMiddleware,assignElectives );

router.post('/substudents', getstudents );
router.delete('/electives',clearSubjectsForAllStudents );

module.exports = router;
// src/routes/professorRoutes.js
const express = require('express');
const { registerProfessor, loginProfessor, getProfessorProfile, updateProfessorProfile, uploadMarks } = require('../controllers/professorController.js');
const { authMiddleware }= require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/register', registerProfessor);
router.post('/login', loginProfessor);
router.get('/profile', authMiddleware, getProfessorProfile);
router.put('/profile', authMiddleware, updateProfessorProfile);
router.post('/upload-marks', authMiddleware, uploadMarks);

module.exports = router;
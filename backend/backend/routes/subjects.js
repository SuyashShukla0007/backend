const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/authMiddleware.js');
const {getEligibleSubjects}= require('../controllers/studentController.js')
const Subject = require('../models/Subject');


router.get('/', authMiddleware, getEligibleSubjects);


module.exports = router;

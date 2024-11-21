// src/models/Mark.js
const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  marks: { type: Number, required: true },
  type: { type: String, required: true }, // e.g., 'midterm', 'final', 'assignment'
});

module.exports = mongoose.model('Mark', markSchema);
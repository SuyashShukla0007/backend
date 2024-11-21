// src/models/Subject.js
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  professor: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Professor' },
  sem: { type: Number, required: true },
  seats: { type: Number, required: false },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'Student'
    }
  ],
  eligibility: { type: [String], required: true } // New eligibility field
});

module.exports = mongoose.model('Subject', subjectSchema);

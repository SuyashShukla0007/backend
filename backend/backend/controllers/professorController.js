const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Professor = require('../models/Professor.js');
const Mark = require('../models/Mark.js');
const Student = require('../models/Student.js');

exports.registerProfessor = async (req, res) => {
  try {
    const { name, email, password, branches, sections } = req.body;

    const existingProfessor = await Professor.findOne({ email });
    if (existingProfessor) {
      return res.status(400).json({ message: 'Professor already exists' });
    }

    const newProfessor = new Professor({
      name,
      email,
      password,
      branches,
      sections,
    });

    await newProfessor.save();

    res.status(201).json({ message: 'Professor registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.loginProfessor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const professor = await Professor.findOne({ email });
    if (!professor) {
      return res.status(404).json({ message: 'Professor not found' });
    }

    const isPasswordCorrect = await professor.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: professor._id, role: 'professor' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.getProfessorProfile = async (req, res) => {
  try {
    const professor = await Professor.findById(req.userId).select('-password');
    if (!professor) {
      return res.status(404).json({ message: 'Professor not found' });
    }

    res.status(200).json(professor);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.updateProfessorProfile = async (req, res) => {
  try {
    const { name, email, branches, sections } = req.body;

    const updatedProfessor = await Professor.findByIdAndUpdate(
      req.userId,
      { name, email, branches, sections },
      { new: true }
    ).select('-password');

    res.status(200).json(updatedProfessor);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.uploadMarks = async (req, res) => {
  try {
    const { studentId, subjectId, marks, type } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const newMark = new Mark({
      student: studentId,
      subject: subjectId,
      marks,
      type,
    });

    await newMark.save();

    res.status(201).json({ message: 'Marks uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};
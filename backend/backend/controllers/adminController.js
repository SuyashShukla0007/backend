const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.js');
const Student = require('../models/Student.js');
const Professor = require('../models/Professor.js');
const Subject = require('../models/Subject');
const mongoose = require('mongoose');

// Make sure you have bcryptjs installed

exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({
      name,
      email: email.toLowerCase(), // Lowercase to avoid case-sensitivity issues
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Error during admin registration:', error); // Log the error for debugging
    res.status(500).json({ message: 'Something went wrong' });
  }
};


exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() }); // Make email lowercase to match registration
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Compare the password with the stored hash
    const isPasswordCorrect =  bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a token
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error during admin login:', error); // Log error for debugging
    res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.getAllProfessors = async (req, res) => {
  try {
    const professors = await Professor.find().select('-password');
    res.status(200).json(professors);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.getstudents = async (req, res) => {
  const { studentIds } = req.body; // Extract the array of student IDs
  try {
    
    // Use Mongoose `find` to fetch students with IDs in the array
    const students = await Student.find({ _id: { $in: studentIds } });
    res.json(students); // Send the matching students back to the frontend
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).send('Error fetching students');
  }
};

exports.assignElectives = async (req, res) => {
  try {
    // Fetch students, sorted by CG in descending order, and populate their choices
    const students = await Student.find().sort({ CG: -1 }).populate('choices');

    for (const student of students) {
      let subjectAssigned = false;

      // Iterate through the student's choices to find an available subject
      for (const elective of student.choices) {
        const subject = await Subject.findById(elective._id);

        if (!subject) {
          console.error(`Subject with ID ${elective._id} not found.`);
          continue;
        }

        if (subject.seats > 0) {
          // Add the subject to the student's assigned subjects
          student.subjects.push(subject._id);

          // Add the student to the subject's students array
          subject.students.push(student._id);
          subject.seats -= 1;

          // Save the updated student and subject
          await student.save({ validateModifiedOnly: true });
          await subject.save();
          subjectAssigned = true;
          break;
        }
      }

      // Assign eligible subject if no choice is available or suitable
      if (!subjectAssigned) {
        const eligibleSubjects = await Subject.find({
          eligibility: student.dept,
          sem: student.sem,
          seats: { $gt: 0 },
        });

        if (eligibleSubjects.length > 0) {
          const fallbackSubject = eligibleSubjects[0];

          // Add the fallback subject to the student's assigned subjects
          student.subjects.push(fallbackSubject._id);

          // Add the student to the fallback subject's students array
          fallbackSubject.students.push(student._id);
          fallbackSubject.seats -= 1;

          // Save the updated student and subject
          await student.save({ validateModifiedOnly: true });
          await fallbackSubject.save();
        } else {
          console.error(`No eligible subjects available for student ${student._id}`);
        }
      }
    }

    res.status(200).json({ message: 'Electives assigned successfully' });
  } catch (error) {
    console.error('Error assigning electives:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

exports.clearSubjectsForAllStudents = async (req, res) => {
  try {
    // Clear the `subjects` array for all students
    await Student.updateMany({}, { $set: { subjects: [] } });

    // Clear the `students` array for all subjects
    await Subject.updateMany({}, { $set: { students: [] } });

    res.status(200).json({ message: 'Subjects cleared for all students and subjects database updated' });
  } catch (error) {
    console.error('Error clearing subjects for all students:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

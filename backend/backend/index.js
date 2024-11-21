// app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const studentRoutes = require('./routes/studentRoutes.js');
const professorRoutes = require('./routes/professorRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const subjectsRoute = require('./routes/subjects.js'); // Correctly import the subjects route
const Subject = require('./models/Subject.js');
const Student = require('./models/Student.js');
const { authMiddleware } = require('./middleware/authMiddleware.js');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Use the subjects route with the prefix '/api/subjects'

app.use(cors());

app.get("/",(req,res)=>{
  return res.send('hello');
})
app.use('/api/eligible-subjects', subjectsRoute);
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).send('Error fetching subjects');
  }
});
// Fetch the selected electives for a student
app.get('/api/student/selected-electives', authMiddleware, async (req, res) => {
  try {
    const studentId = req.userId; // Assuming `id` is stored in the token payload
    const student = await Student.findById(studentId).populate('choices');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ selectedElectives: student.choices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching selected electives' });
  }
});
// Update electives chosen by the student
app.post('/api/student/update-electives',authMiddleware, async (req, res) => {
  try {
    const { selectedElectives } = req.body;
    const studentId = req.userId;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Replace old choices with new ones
    student.choices = selectedElectives;
    await student.save();

    res.json({ message: 'Electives updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating electives' });
  }
});



app.use('/api/student', studentRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

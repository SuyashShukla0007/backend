const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const validator = require('validator');

const professorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: { 
    type: String, 
    required: true,
    minlength: [8, 'Password must be at least 8 characters long']
  },
  role: {
    type: String,
    default: 'professor',
    enum: ['professor']
  },
  branches: [{ 
    type: String,
    trim: true,
    uppercase: true
  }],
  sections: [{ 
    type: String,
    trim: true,
    uppercase: true
  }],
  subjects: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subject' 
  }],
});

// Pre-save hook to hash password
professorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcryptjs.hash(this.password, 12);
  next();
});

// Method to compare passwords
professorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Professor', professorSchema);
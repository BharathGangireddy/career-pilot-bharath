const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const jobSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },

  location: { type: String, default: '' },
  jobUrl: { type: String, default: '' },
  salary: { type: String, default: '' },

  status: {
    type: String,
    enum: ['wishlist', 'applied', 'interview', 'offer', 'rejected'],
    default: 'applied'
  },

  // ⭐🔥 ADD THIS
  pinned: {
    type: Boolean,
    default: false
  },

  jobDescription: { type: String, default: '' },

  coverLetter: { type: String, default: '' },
  resumeTips: { type: String, default: '' },
  interviewQuestions: { type: String, default: '' },

  notes: [noteSchema],

  appliedDate: { type: Date, default: Date.now },
  interviewDate: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
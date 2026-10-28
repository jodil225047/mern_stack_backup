const mongoose = require('mongoose');
const { followUpDateFor, isOverdue } = require('../utils/statusWorkflow');
const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true, enum: ['Applied', 'Interview', 'Offer', 'Rejected', 'Accepted', 'Declined'] },
  changedAt: { type: Date, required: true, default: Date.now }
}, { _id: false });
const applicationSchema = new mongoose.Schema({
  applicationId: { type: String, required: true, unique: true, immutable: true, index: true },
  company: { type: String, required: true, trim: true, maxlength: 120 },
  role: { type: String, required: true, trim: true, maxlength: 120 },
  jobType: { type: String, required: true, enum: ['Full-time', 'Internship', 'Contract'], default: 'Full-time' },
  appliedDate: { type: Date, required: true, immutable: true },
  expectedSalary: { type: Number, min: 0, default: null },
  notes: { type: String, trim: true, maxlength: 5000, default: '' },
  status: { type: String, required: true, enum: ['Applied', 'Interview', 'Offer', 'Rejected', 'Accepted', 'Declined'], default: 'Applied' },
  followUpDate: { type: Date, required: true },
  statusHistory: { type: [statusHistorySchema], default: [] }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
applicationSchema.pre('validate', function(next) {
  if (this.isNew && this.appliedDate) {
    this.followUpDate = followUpDateFor(this.appliedDate);
    if (!this.statusHistory.length) this.statusHistory.push({ status: 'Applied', changedAt: new Date() });
  }
  next();
});
applicationSchema.virtual('isOverdue').get(function() { return isOverdue(this); });
module.exports = mongoose.model('Application', applicationSchema);

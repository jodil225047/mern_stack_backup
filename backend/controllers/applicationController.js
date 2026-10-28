const mongoose = require('mongoose');
const Application = require('../models/Application');
const { generateApplicationId, normalizeCompany } = require('../utils/applicationId');
const { FINAL_STATUSES, DELETABLE_STATUSES, ALL_STATUSES, canTransition, followUpDateFor, isOverdue } = require('../utils/statusWorkflow');
const { success, failure } = require('../utils/response');

function serialize(doc) {
  const item = doc.toObject ? doc.toObject() : doc;
  item.isOverdue = isOverdue(item);
  return item;
}
function validDate(value) {
  const d = new Date(value);
  if (!value || Number.isNaN(d.getTime())) return null;
  return d;
}
function isFutureCalendarDate(date) {
  const today = new Date();
  const utcToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const selected = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return selected > utcToday;
}
function cleanRequired(value) { return typeof value === 'string' ? value.trim() : ''; }
async function findApplication(id) {
  if (mongoose.isValidObjectId(id)) {
    const byMongoId = await Application.findById(id);
    if (byMongoId) return byMongoId;
  }
  return Application.findOne({ applicationId: id });
}
async function createApplication(req, res, next) {
  try {
    const company = cleanRequired(req.body.company);
    const role = cleanRequired(req.body.role);
    const jobType = req.body.jobType || 'Full-time';
    const appliedDate = validDate(req.body.appliedDate);
    if (!company) return failure(res, 400, 'Company name is required.');
    if (!role) return failure(res, 400, 'Job role is required.');
    if (company.length > 120 || role.length > 120) return failure(res, 400, 'Company and role must be 120 characters or fewer.');
    if (!['Full-time', 'Internship', 'Contract'].includes(jobType)) return failure(res, 400, 'Choose a valid job type.');
    if (!appliedDate) return failure(res, 400, 'A valid applied date is required.');
    if (isFutureCalendarDate(appliedDate)) return failure(res, 400, 'Applied date cannot be in the future.');
    let expectedSalary = null;
    if (req.body.expectedSalary !== undefined && req.body.expectedSalary !== '' && req.body.expectedSalary !== null) {
      expectedSalary = Number(req.body.expectedSalary);
      if (!Number.isFinite(expectedSalary) || expectedSalary < 0) return failure(res, 400, 'Expected salary must be a non-negative number.');
    }
    const notes = typeof req.body.notes === 'string' ? req.body.notes.trim() : '';
    if (notes.length > 5000) return failure(res, 400, 'Notes must be 5000 characters or fewer.');
    const existing = await Application.find({ role: { $regex: `^${escapeRegex(role)}$`, $options: 'i' }, status: { $nin: FINAL_STATUSES } });
    if (existing.some(a => normalizeCompany(a.company) === normalizeCompany(company))) return failure(res, 409, 'An active application already exists for this company and role.');
    const applicationId = await generateApplicationId(company);
    const application = await Application.create({ applicationId, company, role, jobType, appliedDate, expectedSalary, notes, status: 'Applied', followUpDate: followUpDateFor(appliedDate), statusHistory: [{ status: 'Applied', changedAt: new Date() }] });
    return success(res, 201, 'Application created successfully.', serialize(application));
  } catch (error) { next(error); }
}
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
async function listApplications(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) {
      if (!ALL_STATUSES.includes(req.query.status)) return failure(res, 400, 'Invalid status filter.');
      filter.status = req.query.status;
    }
    if (req.query.company) filter.company = { $regex: req.query.company.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    const sortBy = req.query.sortBy || 'appliedDate';
    const order = req.query.order === 'asc' ? 1 : -1;
    const sort = ['appliedDate', 'company', 'createdAt'].includes(sortBy) ? { [sortBy]: order } : { appliedDate: -1 };
    const docs = await Application.find(filter).sort(sort).lean();
    return success(res, 200, 'Applications retrieved successfully.', docs.map(serialize));
  } catch (error) { next(error); }
}
async function getApplication(req, res, next) {
  try {
    const doc = await findApplication(req.params.id);
    if (!doc) return failure(res, 404, 'Application not found.');
    return success(res, 200, 'Application retrieved successfully.', serialize(doc));
  } catch (error) { next(error); }
}
async function updateApplication(req, res, next) {
  try {
    const doc = await findApplication(req.params.id);
    if (!doc) return failure(res, 404, 'Application not found.');
    const allowed = ['company', 'role', 'jobType', 'expectedSalary', 'notes'];
    const supplied = allowed.filter(key => Object.prototype.hasOwnProperty.call(req.body, key));
    if (!supplied.length) return failure(res, 400, 'Provide at least one editable field: company, role, jobType, expectedSalary, notes.');
    const patch = {};
    for (const key of supplied) patch[key] = req.body[key];
    if ('company' in patch) { patch.company = cleanRequired(patch.company); if (!patch.company || patch.company.length > 120) return failure(res, 400, 'Company name is required and must be 120 characters or fewer.'); }
    if ('role' in patch) { patch.role = cleanRequired(patch.role); if (!patch.role || patch.role.length > 120) return failure(res, 400, 'Job role is required and must be 120 characters or fewer.'); }
    if ('jobType' in patch && !['Full-time', 'Internship', 'Contract'].includes(patch.jobType)) return failure(res, 400, 'Choose a valid job type.');
    if ('expectedSalary' in patch) { if (patch.expectedSalary === '' || patch.expectedSalary === null) patch.expectedSalary = null; else { patch.expectedSalary = Number(patch.expectedSalary); if (!Number.isFinite(patch.expectedSalary) || patch.expectedSalary < 0) return failure(res, 400, 'Expected salary must be a non-negative number.'); } }
    if ('notes' in patch) { if (typeof patch.notes !== 'string') return failure(res, 400, 'Notes must be text.'); patch.notes = patch.notes.trim(); if (patch.notes.length > 5000) return failure(res, 400, 'Notes must be 5000 characters or fewer.'); }
    const company = patch.company || doc.company;
    const role = patch.role || doc.role;
    const matches = await Application.find({ _id: { $ne: doc._id }, role: { $regex: `^${escapeRegex(role)}$`, $options: 'i' }, status: { $nin: FINAL_STATUSES } });
    if (matches.some(a => normalizeCompany(a.company) === normalizeCompany(company))) return failure(res, 409, 'These company and role details would duplicate another active application.');
    Object.assign(doc, patch);
    await doc.save();
    return success(res, 200, 'Application updated successfully.', serialize(doc));
  } catch (error) { next(error); }
}
async function updateStatus(req, res, next) {
  try {
    const doc = await findApplication(req.params.id);
    if (!doc) return failure(res, 404, 'Application not found.');
    const nextStatus = req.body.status;
    if (!ALL_STATUSES.includes(nextStatus)) return failure(res, 400, 'Choose a valid status.');
    if (!canTransition(doc.status, nextStatus)) return failure(res, 400, `Cannot change status from ${doc.status} to ${nextStatus}.`);
    doc.status = nextStatus;
    doc.statusHistory.push({ status: nextStatus, changedAt: new Date() });
    await doc.save();
    return success(res, 200, 'Application status updated successfully.', serialize(doc));
  } catch (error) { next(error); }
}
async function deleteApplication(req, res, next) {
  try {
    const doc = await findApplication(req.params.id);
    if (!doc) return failure(res, 404, 'Application not found.');
    if (!DELETABLE_STATUSES.includes(doc.status)) return failure(res, 400, `Applications in ${doc.status} status cannot be deleted. Move the application to a permitted final state first.`);
    await doc.deleteOne();
    return success(res, 200, 'Application deleted successfully.', { applicationId: doc.applicationId });
  } catch (error) { next(error); }
}
module.exports = { createApplication, listApplications, getApplication, updateApplication, updateStatus, deleteApplication };

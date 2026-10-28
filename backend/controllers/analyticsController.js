const Application = require('../models/Application');
const { success } = require('../utils/response');
const { isOverdue } = require('../utils/statusWorkflow');
async function getSummary(req, res, next) {
  try {
    const apps = await Application.find({}).lean();
    const count = status => apps.filter(a => a.status === status).length;
    const total = apps.length;
    const interviews = apps.filter(a => ['Interview', 'Offer', 'Accepted', 'Declined'].includes(a.status)).length;
    const offers = apps.filter(a => ['Offer', 'Accepted', 'Declined'].includes(a.status)).length;
    const accepted = count('Accepted');
    const summary = {
      totalApplications: total, applied: count('Applied'), interviews: count('Interview'), offers: count('Offer'), accepted, rejected: count('Rejected'), declined: count('Declined'),
      interviewConversionRate: total ? Math.round((interviews / total) * 100) : 0,
      offerConversionRate: total ? Math.round((offers / total) * 100) : 0,
      acceptedOfferRate: offers ? Math.round((accepted / offers) * 100) : 0,
      recentApplications: apps.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5).map(a => ({...a, isOverdue:isOverdue(a)})),
      followUps: apps.filter(a => a.status === 'Applied').sort((a,b) => new Date(a.followUpDate)-new Date(b.followUpDate)).slice(0,8).map(a => ({...a, isOverdue:isOverdue(a)}))
    };
    return success(res, 200, 'Analytics summary retrieved successfully.', summary);
  } catch (error) { next(error); }
}
module.exports = { getSummary };

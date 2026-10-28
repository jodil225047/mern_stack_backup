const TRANSITIONS = {
  Applied: ['Interview', 'Rejected'],
  Interview: ['Offer', 'Rejected'],
  Offer: ['Accepted', 'Declined'],
  Rejected: [], Accepted: [], Declined: []
};
const FINAL_STATUSES = ['Rejected', 'Accepted', 'Declined'];
const DELETABLE_STATUSES = ['Applied', ...FINAL_STATUSES];
const ALL_STATUSES = Object.keys(TRANSITIONS);
function canTransition(from, to) { return (TRANSITIONS[from] || []).includes(to); }
function followUpDateFor(appliedDate) {
  const date = new Date(appliedDate);
  date.setUTCDate(date.getUTCDate() + 7);
  return date;
}
function calendarDateUTC(value) {
  const d = new Date(value);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
function isOverdue(application, now = new Date()) {
  return application.status === 'Applied' && calendarDateUTC(now) > calendarDateUTC(application.followUpDate);
}
module.exports = { TRANSITIONS, FINAL_STATUSES, DELETABLE_STATUSES, ALL_STATUSES, canTransition, followUpDateFor, isOverdue };

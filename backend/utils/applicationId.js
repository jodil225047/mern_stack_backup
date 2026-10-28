const Counter = require('../models/Counter');

function normalizeCompany(company) {
  return company.trim().toLocaleLowerCase('en-US').replace(/\s+/g, ' ');
}
function companyPrefix(company) {
  const letters = company.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return (letters || 'JOB').slice(0, 3).padEnd(3, 'X');
}
async function generateApplicationId(company) {
  const key = normalizeCompany(company);
  const counter = await Counter.findOneAndUpdate(
    { _id: key }, { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return `JA-${companyPrefix(company)}-${String(counter.sequence).padStart(3, '0')}`;
}
module.exports = { generateApplicationId, normalizeCompany, companyPrefix };

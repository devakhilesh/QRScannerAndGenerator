// helpers/validationHelper.js

const { isValidDate } = require('date-fns');

/**
 * Converts strings to Date format, if they are valid ISO strings.
 * Also handles validation of startDate, endDate, and any other data that might require conversion.
 * @param {Object} data - The data containing potential date strings.
 * @returns {Object} - Returns an object with status (true/false) and a message.
 */
function validateAndFormatBatchData(data) {
  // Convert startDate and endDate if they are strings
  if (typeof data.duration.startDate === 'string') {
    const parsedStartDate = new Date(data.duration.startDate);
    if (!isValidDate(parsedStartDate)) {
      return { status: false, message: 'Invalid startDate. Please provide a valid ISO date.' };
    }
    data.duration.startDate = parsedStartDate;
  }

  if (typeof data.duration.endDate === 'string') {
    const parsedEndDate = new Date(data.duration.endDate);
    if (!isValidDate(parsedEndDate)) {
      return { status: false, message: 'Invalid endDate. Please provide a valid ISO date.' };
    }
    data.duration.endDate = parsedEndDate;
  }

  // Check if endDate is after startDate
  if (data.duration.startDate >= data.duration.endDate) {
    return { status: false, message: 'endDate must be later than startDate.' };
  }

  // Everything is valid
  return { status: true, message: 'Validation successful.' };
}

module.exports = {
  validateAndFormatBatchData,
};

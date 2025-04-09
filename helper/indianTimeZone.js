const moment = require("moment-timezone");

exports.currentIndianTimestamps = function() {
    // Get current time in Kolkata time zone
    const kolkataTimestamp = moment().tz("Asia/Kolkata").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

    // Log the timestamp to the console

    return kolkataTimestamp;
};
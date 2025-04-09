
exports.sendErrorResponse = (res, statusCode, message) => {
    res.status(statusCode).json({
      status: false,
      message: message,
    });
  };
  
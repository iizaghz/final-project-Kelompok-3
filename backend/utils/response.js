/**
 * Helper respons JSON API terstandar
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message, error = null, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ? (error.message || error) : null,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};

class AppError extends Error {
  constructor(...errorArgs) {
    super(...errorArgs);
    Error.captureStackTrace(this, AppError);

    this.isAppError = true;
  }
}

module.exports = {
  AppError
};
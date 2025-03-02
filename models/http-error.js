class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // Adds a "message" property to the instances
    this.code = errorCode; // Adds a "code" property to the instances
  }
}

module.exports = HttpError;

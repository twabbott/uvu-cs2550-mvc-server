const config = require("config");

function getValue(key, defaultValue) {
  const value = 
    process.env[key] ||
    config.get(key) ||
    defaultValue;

  if (!value) {
    console.error(`FATAL ERROR: ${key} not defined.`);
    process.exit(1);
  }

  return value;
}

module.exports = {
  port: getValue("PORT", 3000),
  jwtSecret: getValue("JWT_SECRET"),
  dbConnectionUrl: getValue("DB_CONNECTION_URL"),
  devMode: true
};
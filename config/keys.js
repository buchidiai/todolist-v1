if (process.env.NODE_ENV === "production") {
  module.exports = require("./prodkey");
} else {
  module.exports = require("./devKey");
}

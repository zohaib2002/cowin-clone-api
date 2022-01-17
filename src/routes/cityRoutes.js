const cityController = require("../controllers/cityController");

module.exports = (app) => {
  app.get("/cities/:state", cityController.query);
};

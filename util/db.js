const db = require("../lib/database");
const database = db.client.db("Sidra");
module.exports = database;

const mongodb = require("mongodb");
const uri = require("./db_uri");
const client = new mongodb.MongoClient(uri);
const connectToDB = async () => {
  try {
    await client.connect();
    console.log(`Connected to Sidra database 🍯🍯🐝🐝`);
  } catch (err) {
    console.log("Error occured when connecting to DB: " + err);
  }
};
module.exports = { client, connectToDB };

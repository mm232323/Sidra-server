const express = require("express");

const bodyParser = require("body-parser");

const connect = require("./lib/database");

const mainRoutes = require("./routes/main");

const app = express();

app.use(bodyParser({ extended: false }));

const main = async () => {
  try {
    await connect.connectToDB();
    console.log("seccussful connected to sidra database");
  } catch (err) {
    console.log("connecting failed");
  }
};
main();

app.use("/", mainRoutes);

app.use("/", (req, res, next) => {
  res.send("<h1>hello world</h1>");
});

app.listen(2010);

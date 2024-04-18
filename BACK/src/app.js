const express = require("express");
const morgan = require("morgan");
const paymentRouter = require("./Routes/payment");
const app = express();

// Middles
app.use(express.json());
app.use(morgan("dev"));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});
app.use("/payment", paymentRouter);

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "server listening" });
});

module.exports = app;

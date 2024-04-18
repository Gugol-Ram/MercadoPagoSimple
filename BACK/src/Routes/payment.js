const express = require("express");
const createOrder = require("../Controllers/createOrder");
const paymentRouter = express.Router();

// Orden de pago(para redirigir a la pagina de ML a pagar)
paymentRouter.post("/create-order", createOrder);
// En caso de exito:
paymentRouter.get("/success", (req, res) => {
  console.log("MercadoPAgo Data: ", req.query);
  //deberia agregar logica para guardar codigo de transaccion en una BD; y logica para modificar el stock del producto si hubo exito en el pago

  res.redirect("http://localhost:5173/"); //redirijo a la ruta que quiero mostrar luego de que MP me devuelve el control, como no tengo otras lo redirijo a home, pero podria ser la que quiera/necesaria
  // res.status(200).json({ message: "Pago REalizado" });
});

// En caso de error:
paymentRouter.get("/failure", (req, res) => {
  console.log("MercadoPAgo Data: ", req.query);

  res.redirect("http://localhost:5173/");
  // res.status(200).json({ message: "Pago rechazado" });
});

//pendiente

paymentRouter.get("/pending", (req, res) => {
  console.log("MercadoPAgo Data: ", req.query);
  res.redirect("http://localhost:5173/");
  // res.status(200).json({ message: "Pendiente" });
});

module.exports = paymentRouter;

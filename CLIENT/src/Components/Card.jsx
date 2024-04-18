/* eslint-disable react/prop-types */
import { useState } from "react";
import axios from "axios";

export default function Card({ product }) {
  //estado local para ir guardando las cantidades que quiero comrpar de un producto.
  const [quantity, setQuantity] = useState(1);
  const quantityIncrement = () => {
    product.stock > quantity ? setQuantity(quantity + 1) : null;
  };
  const quantityDecrement = () => {
    quantity > 1 ? setQuantity(quantity - 1) : null;
  };

  // envio de info para el backend
  const checkOut = () => {
    axios
      .post("http://localhost:3001/payment/create-order", {
        ...product,
        quantity,
      }) //le paso el producto y su cantidad al back
      .then((response) => {
        window.location.href = response.data.body.init_point;
      }) //la respuesta del back es tooodo lo que devolvia el thunder, pero yo solo quiero la url que contiene 'init_point'
      .catch((error) => console.log(error.message));
  };

  return (
    <div
      style={{
        backgroundColor: "grey",
        width: "400px",
        padding: "15px",
        margin: "15px",
      }}
    >
      <h1>{product.title}</h1>
      <img style={{ width: "150px" }} src={product.image} alt={product.title} />
      <h4>
        <strong>Precio: $</strong>
        {product.price}
      </h4>
      <h4>
        <strong>Descripción: </strong>
        {product.description}
      </h4>
      <h4>
        <strong>Stock: </strong>
        {product.stock}
      </h4>
      <h5>Cantidad: {quantity}</h5>
      <button style={{ margin: "5px" }} onClick={quantityIncrement}>
        +
      </button>
      <button style={{ margin: "5px" }} onClick={quantityDecrement}>
        -
      </button>
      <button style={{ margin: "5px" }} onClick={checkOut}>
        Comprar!
      </button>
      {/*
    <p>Stock: {product.stock}</p>
    <p>Condition: {product.condition}</p>
    <p>Price: {product.price}</p> */}
    </div>
  );
}

# Configuraciones iniciales MP:

## ACCESS_TOKEN

PRIMERO crear dos usuarios de prueba con mi cuenta real,Uno tipo comprador(vendedor) y otro tipo Vendedor(comprador)(verificar estos roles 'invertidos').
Además, obtener tarjetas de prueba tambien de mi cuenta real (anotarlas en algun lado) que serviran para testear escenarios. Cierro sesión de mi cuenta real e ingreso a la cuenta DE PRUEBA que hara el rol de vendedor y crear una nueva integracion(aplicación)que contendrá:
🔸NOMBRE
🔸tipo de solucion: pago online
🔸plataforma ecommerce: no
🔸producto integrado: CheckoutPRO
🔸modelo de integracion: marketplace y billeteraMP.
luego de creada la integracion entro en ella para obtener el token de prueba de este usuario.

### ESTE SERÁ EL TOKEN UTILIZADO PARA TESTEAR.

### CIERRO SESIÓN DE ESTE USUARIO DE PRUEBA.

Luego de realizado la configuracion backend/frontend al iniciar el proceso de compra e ir al 'init_point' puedo previamente haber iniciado sesion en la cuenta de PRUEBA que toma el rol del comprador, en dicho caso solo tendré disponible el pago a traves de dinero ficticio de la billetera. Si no tengo la sesión iniciada al momento de realizar el pago entonces tendré la opción de ingresar a la cuenta de prueba o pagar como invitado, y en ese caso podré utilizar las TARJETAS DE PRUEBA e ir testeando los distintos escenarios.

# CONFIGURACIONES BACKEND:

Iniciamos un nuevo backend

```
npm init -y
```

luego instalamos algunas dependencias:
Express
morgan
dotenv
nodemon(como libreria de desarrollo)

```
npm i express morgan dotenv
...
npm install --save-dev nodemon
```

Luego en mi package.json agrego el script de start nodemon

```
...
 "scripts": {
    "start": "nodemon",
 }
 ...
```

Y también instalamos la dependencia de mercado pago, en este caso la version 1 (actualmente ya se encuentra la 2)

```
npm install mercadopago@1.5.16
```

### En app invoco la ruta utilizar

```
app.use("/payment", paymentRouter)
```

### Carpeta routes y archivo respectivo(payment.js)

Me traigo express para los enrutados y el/los controlador/es necesarios

```
const paymentRouter = express.Router()
const createOrder = require("../Controllers/createOrder");
```

Necesito hacer una peticion POST a mi controlador de create order para inicializar un pedido recibiendo los parametros por body.

```
paymentRouter.post("/create-order", createOrder)
```

Ademas necesitare hacer las rutas para los distintos escenarios que podrían suceder como exito, fracaso o pendiente

```
paymentRouter.get("/success", (req, res) => {
  console.log("MercadoPAgo Data: ", req.query);

  res.redirect("http://localhost:5173/");
  // res.status(200).json({ message: "Pago realizado" });
});

module.exports = paymentRouter;
```

Con 'redirect' elijo a que ruta me redireccione cuando se finalice el proceso en la ventana de MP, si no tengo aún definida una ruta podría solo imprimir un mensaje de éxito utilizando 'status'. Misma lógica para el caso de failure o pending

## CONTROLLER

En este punto necesitamos tener instalado la dependencia de MP: 'npm install mercadopago'
Y también dotenv para realizar conexiones de entorno: 'npm i dotenv'

Iniciamos importando mercado pago, y tambien dotenv, y ademas de ello las variables de entorno que sean necesarias para este controlador en cuestion, ESCENCIAL mi variable ACCES_TOKEN, luego puede haber variables de back o front urls y otras credenciales pertinentes.

```
const mercadopago = require("mercadopago");
require("dotenv").config({ path: "./.env" });
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
```

Configuramos mercado pago con nuestro access token(requerimiento PROPIO de MP)

```
mercadopago.configure({
  access_token: ACCESS_TOKEN,
});
```

Creamos nuestra constante que realizara la petición/creación del pago, recibe los parametros de la request por body, y ES UNA PROMESA, se puede hacer utilizando **_async await_** o **_.then_**.

Además, hay que definir una preferencia(preference)que es un requisito PROPIO de MP, es decir es lo esperado por la API de MP para funcionar, puede tener varias propiedades pero escencialmente para funcionar requiere de:

🔸 **_title_** : Título o Nombre del producto que se esta comprando.

🔸 **_quantity_** : Cantidad comprada.

🔸 **_unit_price_** : Precio Unitario.

🔸 **_currency_id_** : Moneda en la que se realiza la TRANSACCIÓN(importante!!).

Luego podría contener otros atributos como descripción, imagen, etc pero no es necesario para procesar el pago.

```
let preference = {
    items: [
      {
        id: id,
        title: title,
        description: description,
        picture_url: image,
        quantity: quantity,
        description: description,
        unit_price: price,
        currency_id: "ARS",
      },
    ],
    back_urls: {...},
    }
```

Dentro de la variable 'preference' también necesitamos definir nuestras url de retorno según el resultado de la operación:
🔸success
🔸failure
🔸pending

```
back_urls: {
      success: "http://localhost:3001/payment/success",
      failure: "http://localhost:3001/payment/failure",
      pending: "http://localhost:3001/payment/pending",
    }
```

Finalizamos creando la promesa, que contendra lo recibido en 'preference' y esperará la respuesta de la API de MP.
Si todo sale OK devolvera un array con muchas propiedades, entre las que estará la url para realizar el pago(init_point) y que es la que atraparemos desde el front para redirigir allí al hacer click en comprar. Esta url va mutando en cada petición por lo que no es estática y hay que capturarla en el momento de hacer la petición

```{... codigo previo

mercadopago.preferences
    .create(preference)
    .then((response) => res.status(200).json(response))
    .catch((error) => res.status(400).json({ message: error.message }));
}
    module.exports = createOrder;
```

Esto seria lo básico del back para poder testear, puedo hacer una petición por ThunderClient, Postman etc para verificar el funcionamiento correcto. petición tipo POST a:

```
http://localhost:3001/payment/create-order

//y por body deberia enviar la información necesaria/esperada

{
        "id":1,
        "title":"TESTo COMPRA:Celular MOTOROLA MOTO E13",
        "description":"Celular de 6.5. IPS (720 x 1600) HD+, 60 HZ. Prcesador Octa core 1.6 GHz",
        "image":"https://tosellihogar.com.ar/wp-content/uploads/2023/01/4682-8.jpg",
        "stock":5,
        "condition":"new",
        "price": 2,
        "quantity": 1
    }

```

Respuesta esperada del back si sale todo OK, donde destacamos la url que necesitamos tomar en el front para redirigir al pago.

```
{
  "body": {
    "additional_info": "",
    "auto_return": "",
    "back_urls": {
      "failure": "http://localhost:3001/payment/failure",
      "pending": "http://localhost:3001/payment/pending",
      "success": "http://localhost:3001/payment/success"
    },
    "binary_mode": false,
    "client_id": "4126054116632038",
    "collector_id": 79516326,
    "coupon_code": null,
    "coupon_labels": null,
    "date_created": "2024-04-03T18:04:53.030-04:00",
    "date_of_expiration": null,
    "expiration_date_from": null,
    "expiration_date_to": null,
    "expires": false,
    "external_reference": "",
    "id": "79516326-c6f69041-1db2-4845-adf8-0f824df16ec1",
    ⚠️"init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=79516326-c6f69041-1db2-4845-adf8-0f824df16ec1"⚠️,
    "internal_metadata": null,
    "items": [...],
  ...},
  ...}
```

# CONFIGURACIONES FRONTEND

En la carpeta Raíz creo un nuevo proyecto Vite por terminal.

```
npm create vite@latest
...
project name: CLIENT o FRONT etc (creará la carpeta)
...
framework: React
...
variant: JavaScript
```

Luego veremos el mensaje

```
Done. Now run:

cd client (o nombre elegido)
npm install(instala dependencias básicas)
npm i axios(conectar al back)
npm run dev(para empezar a correr el cliente)
```

```

```

## COMPONENTE CARDS

Encargado de renderizar todos los productos. Solo hará un mapeo de los productos, en este caso guardado en un archivo products.js pero normalmente sería obtenido de la BD.
Importo tanto la info de esos productos como el componente Card para hacer el renderizado de c/u.

```
import products from "../Utils/products";
import Card from "./Card";

export default function Cards() {
  return (
    <div>
      {products.map((product) => (
        <Card key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## COMPONENTE CARD

Acá viene el renderizado propio de cada producto que se mostrará, los botones de agregar más de un producto y el boton de comprar para redirigir a la pagina de Mercado Pago. Por el momento no tiene carrito de compras, es decir solo se puede comprar determinada cantidad de un producto, y repetir el proceso para cada producto distinto.

Utilizo useState para setear las cantidades compradas(poder comprar más de una unidad) y 'axios' para poder enviarle al back la petición

```
import { useState } from "react";
import axios from "axios";

```

También necesitaré crear una lógica para darle la funcionalidad a los botones de sumar mas de una unidad de un producto

```
export default function Card({ product }) {
  //estado local para ir guardando las cantidades que quiero comrpar de un producto.
  const [quantity, setQuantity] = useState(1);

const quantityIncrement = () => {
    product.stock > quantity ? setQuantity(quantity + 1) : null;
  };
  const quantityDecrement = () => {
    quantity > 1 ? setQuantity(quantity - 1) : null;
  };
...resto del código...}
```

Lógica para enviar la petición al back

```
 ...código anterior...

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
  ...resto código(renderizado)...
```

Por ultimo renderizo la Card de c/producto con la info específica que quiero mostrar, boton para aumentar o disminuir cantidad haciendo uso del 'onClick'.
Y por último botón de compra también con uso de 'onClick' para procesar la compra y redirigir a la pagina de MP.

```
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
```

```

```

```

```

```

```

```

```

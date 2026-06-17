require("dotenv").config();

const express = require("express");
const path = require("path");
console.log("Sirviendo estáticos desde:", path.join(__dirname, "../frontend/pages"));

// Routers
const hotelesRouter = require("./routes/hoteles");
const checkoutRouter = require('./routes/checkout');

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.static(path.join(__dirname, "../frontend/pages")));


// Endpoints
app.use("/api/hoteles", hotelesRouter);
app.use("/api/checkout", checkoutRouter);

const PORT = 3000;


app.listen(PORT, () => {
    console.log('http://localhost:3000/index.html - Menu');
    console.log('http://localhost:3000/admin.html - Administrador');
    console.log(`Servidor iniciado en puerto ${PORT}`);
});

//
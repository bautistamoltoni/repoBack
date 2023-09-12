
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketIo = require('socket.io');
const handlebars = require('express-handlebars');
const path = require('path');
const fsPromises = require('fs/promises');
const socketModule = require('./socket.js');
const productsRouter = require('./routes/products.js');
const cartsRouter = require("./routes/carts.js")
const productsFilePath = path.join(__dirname, './products.json');

const io = new socketIo.Server(server);

socketModule(io);
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.json());

app.use('/api/products', productsRouter(io));
app.use('/api/carts', cartsRouter);

app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'handlebars');

app.get('/', async (req, res) => {
    try {
        const productsData = await fsPromises.readFile(productsFilePath, 'utf8');
        const products = JSON.parse(productsData);
        res.render('home', { products });
    } catch (error) {
        console.error('Error al obtener los datos de los productos:', error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

async function obtenerProductos(productsFilePath) {
    try {
        const data = await fsPromises.readFile(productsFilePath, 'utf8');
        const productsData = JSON.parse(data);
        return productsData;
    } catch (error) {
        console.error('Error al obtener los datos de los productos:', error);
        return [];
    }
}

app.get('/realtimeproducts', async (req, res) => {
    try {
        const productsData = await obtenerProductos(productsFilePath);
        res.render('realTimeProducts', { products: productsData });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});



server.listen(8080, function () {
    console.log("Servidor corriendo en http://localhost:8080");
});

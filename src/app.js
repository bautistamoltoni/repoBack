
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketIo = require('socket.io');
const handlebars = require('express-handlebars');
const path = require('path');
const fsPromises = require('fs/promises');
const socketModule = require('./socket.js');
const productsRouter = require('./dao/routesMongo/products.js');
const cartsRouter = require("./dao/routesMongo/carts.js")
const productsFilePath = path.join(__dirname, './products.json');
const mongoose = require('mongoose');
const io = new socketIo.Server(server);
const MessageModelo = require('./dao/models/message.model.js');
socketModule(io);
app.use(express.static(path.join(__dirname, '/public')))

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

app.get('/chat', async (req, res) => {
    try {
      // Recupera todos los mensajes desde la base de datos
      const mensajes = await MessageModelo.find().sort({ createdAt: 1 });
  
      // Renderiza la vista del chat y pasa los mensajes
      res.status(200).render('chat', { mensajes });
    } catch (error) {
      console.error('Error al recuperar mensajes:', error);
      res.status(500).json({ error: 'Error al recuperar mensajes' });
    }
  });
let mensajes=[{
    emisor:'Server',
    mensaje:'Bienvenido al chat del curso Backend...!!!'
}]

let usuarios=[]
io.on('connection', socket=>{
    console.log('se ha conectado un cliente')

    socket.on('id', nombre=>{
        console.log(nombre)

        usuarios.push({
            id: socket.id,
            nombre
        })

        socket.emit('bienvenida', mensajes)

        socket.broadcast.emit('nuevoUsuario', nombre)

    })
    socket.on('nuevoMensaje', async (mensaje) => {
        // Crea un nuevo documento de mensaje utilizando los valores proporcionados por el usuario
        const nuevoMensaje = new MessageModelo({
          user: mensaje.user,
          message: mensaje.message
        });
      
        try {
          // Guarda el mensaje en MongoDB
          await nuevoMensaje.save();
      
          // Envía el mensaje a todos los clientes
          io.emit('llegoMensaje', mensaje);
        } catch (error) {
          console.error('Error al guardar el mensaje en MongoDB:', error);
          // Puedes manejar el error aquí
        }
      });
      

    socket.on('disconnect',()=>{
        console.log(`se desconecto el cliente con id ${socket.id}`)
        let indice=usuarios.findIndex(usuario=>usuario.id===socket.id)
        let usuario=usuarios[indice]
        io.emit('usuarioDesconectado', usuario)
        console.log(usuario)
        usuarios.splice(indice,1)
    })

})




server.listen(8080, function () {
    console.log("Servidor corriendo en http://localhost:8080");
});


    async function connectToDatabase() {
        try {
          await mongoose.connect('mongodb+srv://bautistamoltoni:petarda264@cluster0.ka4ilqn.mongodb.net/?retryWrites=true&w=majority&dbName=ecommerce');
          console.log('Conexión exitosa a la base de datos');
        } catch (error) {
          console.error('Error al conectar a la base de datos:', error);
        }
      }

      connectToDatabase();
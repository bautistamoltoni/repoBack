
const socketIo = require('socket.io');
const fsPromises = require('fs/promises'); // Importa fsPromises aquí
const path = require('path');
const productsFilePath = path.join(__dirname, './products.json');



function initializeSocket(server, productsFilePath) { 
  const io = socketIo(server);

  io.on('connection', (socket) => { 
    console.log("Nuevo cliente conectado");

    socket.on('producto-agregado', async (nuevoProducto) => {
      try {
        const productsData = await obtenerProductos(productsFilePath); 

        productsData.push(nuevoProducto);

        await fsPromises.writeFile(productsFilePath, JSON.stringify(productsData, null, 2));

        io.emit('productos-actualizados', productsData);
      } catch (error) {
        console.error('Error al agregar producto:', error);
      }
    });

    socket.on('producto-eliminado', async (productId) => {
      try {
        const productsData = await obtenerProductos(productsFilePath); 

        const productosActualizados = productsData.filter((product) => product.id !== productId);

        await fsPromises.writeFile(productsFilePath, JSON.stringify(productosActualizados, null, 2));

        io.emit('productos-actualizados', productosActualizados);
      } catch (error) {
        console.error('Error al eliminar producto:', error);
      }
    });
  });
}

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

module.exports = initializeSocket;


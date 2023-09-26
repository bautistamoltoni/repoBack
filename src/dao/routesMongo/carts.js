const express = require('express');
const fsPromises = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cartsModelo = require('../models/carts.model.js')



const cartsRouter = express.Router();


function generateUniqueId() {
    return uuidv4();
}

const cartsFilePath = path.join(__dirname,'../carrito.json');
const productsFilePath = path.join(__dirname,'../products.json');


cartsRouter.post('/', async (req, res) => {
    try {
      // Obtén los datos del carrito del cuerpo de la solicitud
      const cartData = req.body;
  
      // Crea un nuevo carrito utilizando el modelo de Mongoose
      const newCart = await cartsModelo.create(cartData);
  
      // Devuelve el nuevo carrito como respuesta
      res.status(201).json(newCart);
    } catch (error) {
      console.error('Error al crear el carrito:', error);
      res.status(500).json({ error: 'Error al crear el carrito' });
    }
  });




cartsRouter.get('/:id', async (req, res) => {

    const cartId = req.params.id;
    let encontrarCartPorId=await cartsModelo.findById(cartId)

    res.status(200).json({encontrarCartPorId})

});



// Ruta para agregar un producto a un carrito
cartsRouter.post('/:cartId/product/:productId', async (req, res) => {
  try {
    // Obtenemos el ID del carrito y del producto de los parámetros de la URL
    const cartId = req.params.cartId;
    const productId = req.params.productId;
    const productIdNumber = parseInt(productId,10);
    // Obtén el carrito correspondiente al cartId
    const cart = await cartsModelo.findById(cartId);
    if (isNaN(productIdNumber)) {
        return res.status(400).json({ error: 'El productId no es un número válido' });
    }

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    
    // Verificar si el producto ya está en el carrito
    const existingProduct = cart.products.find(product => product.product === productId);

    if (existingProduct) {
      // Si el producto ya existe en el carrito, puedes realizar alguna acción como aumentar la cantidad.
      existingProduct.quantity += 1;
    } else {
      // Si el producto no está en el carrito, agrégalo con cantidad 1.
      cart.products.push({ product: productId, quantity: 1 });
    }

    // Guarda el carrito actualizado
    await cart.save();

    // Responde con el carrito actualizado
    res.json(cart);
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

module.exports = cartsRouter;




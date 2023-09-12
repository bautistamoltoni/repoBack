const express = require('express');
const fsPromises = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');




const cartsRouter = express.Router();


function generateUniqueId() {
    return uuidv4();
}

const cartsFilePath = path.join(__dirname,'../carrito.json');
const productsFilePath = path.join(__dirname,'../products.json');


cartsRouter.post('/', async (req, res) => {

    try {
        const newCart = {
            id: generateUniqueId(), 
            products: []
        };

        const data = await fsPromises.readFile(cartsFilePath, 'utf8');
        const carts = JSON.parse(data);

        carts.push(newCart);
        await fsPromises.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));

        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el carrito' });
    }
});

cartsRouter.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cartData = await fsPromises.readFile(cartsFilePath, 'utf8');
        const carts = JSON.parse(cartData);

        const cart = carts.find(cart => cart.id.toString() === cartId);

        if (!cart) {
            res.status(404).json({ error: 'Carrito no encontrado' });
        } else {
            const productData = await fsPromises.readFile(productsFilePath, 'utf8');
            const products = JSON.parse(productData);

            const cartProducts = cart.products.map(item => {
                const product = products.find(product => product.id === item.product);
                return { ...product, quantity: item.quantity };
            });

            res.json(cartProducts);
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos del carrito' });
    }
});

cartsRouter.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = parseInt(req.params.pid);
        const { quantity } = req.body;

        const cartData = await fsPromises.readFile(cartsFilePath, 'utf8');
        const carts = JSON.parse(cartData);

        const cartIndex = carts.findIndex(cart => cart.id.toString() === cartId);

        if (cartIndex === -1) {
            res.status(404).json({ error: 'Carrito no encontrado' });
            return;
        }

        const productData = await fsPromises.readFile(productsFilePath, 'utf8');
        const products = JSON.parse(productData);

        const productToAdd = products.find(product => product.id === productId);

        if (!productToAdd) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }

        const cart = carts[cartIndex];
        const existingProductIndex = cart.products.findIndex(item => item.product === productId);

        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += quantity;
        } else {
            cart.products.push({ product: productId, quantity });
        }

        await fsPromises.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));

        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el producto al carrito' });
    }
});

module.exports = cartsRouter
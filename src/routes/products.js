
const express = require('express');
const fsPromises = require('fs/promises');
const path = require('path');

const productsRouter = express.Router();
const productsFilePath = path.join(__dirname, '../products.json');

module.exports = (io) => {
    productsRouter.get('/', async (req, res) => {
        try {
            const limit = req.query.limit;
            const data = await fsPromises.readFile(productsFilePath, 'utf8');
            const products = JSON.parse(data);

            if (limit) {
                res.json(products.slice(0, parseInt(limit)));
            } else {
                res.json(products);
            }
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los productos' });
        }
    });

    productsRouter.get('/:pid', async (req, res) => {
        try {
            const productId = req.params.pid;
            const data = await fsPromises.readFile(productsFilePath, 'utf8');
            const products = JSON.parse(data);

            const product = products.find(product => product.id.toString() === productId);

            if (!product) {
                res.status(404).json({ error: 'Producto no encontrado' });
            } else {
                res.json(product);
            }
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el producto' });
        }
    });

    productsRouter.put('/:pid', async (req, res) => {
        try {
            const productId = parseInt(req.params.pid);
            const updatedData = req.body;
            const data = await fsPromises.readFile(productsFilePath, 'utf8');
            const products = JSON.parse(data);

            const productIndex = products.findIndex(product => product.id === productId);

            if (productIndex === -1) {
                res.status(404).json({ error: 'Producto no encontrado' });
            } else {
                products[productIndex] = { ...products[productIndex], ...updatedData };
                await fsPromises.writeFile(productsFilePath, JSON.stringify(products, null, 2));
                res.json(products[productIndex]);
            }
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el producto' });
        }
    });

    productsRouter.post('/', async (req, res) => {
        try {
            const productData = req.body;
            const data = await fsPromises.readFile(productsFilePath, 'utf8');
            const products = JSON.parse(data);

            const newProduct = {
                id: Math.max(...products.map(product => product.id), 0) + 1,
                ...productData
            };

            products.push(newProduct);
            await fsPromises.writeFile(productsFilePath, JSON.stringify(products, null, 2));

            io.emit('productos-actualizados', products);

            res.status(201).json(newProduct);
        } catch (error) {
            res.status(500).json({ error: 'Error al agregar el producto' });
        }
    });

    productsRouter.delete('/:pid', async (req, res) => {
        try {
            const productId = parseInt(req.params.pid);
            const data = await fsPromises.readFile(productsFilePath, 'utf8');
            let products = JSON.parse(data);

            products = products.filter(product => product.id !== productId);
            await fsPromises.writeFile(productsFilePath, JSON.stringify(products, null, 2));

            io.emit('productos-actualizados', products);

            res.json({ message: 'Producto eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar el producto' });
        }
    });

    return productsRouter;
};



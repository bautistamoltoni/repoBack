
const express = require('express');
const fsPromises = require('fs/promises');
const path = require('path');
const  productsModelo  = require('../models/products.model.js');
const { default: mongoose } = require('mongoose');



const productsRouter = express.Router();
const productsFilePath = path.join(__dirname, '../products.json');

module.exports = (io) => {
    productsRouter.get('/', async (req, res) => {

        let  products =await productsModelo.find()
        res.status(200).json({products})
    });

    productsRouter.get('/:id', async (req, res) => {

        let  productId =req.params.id;
        let encontrarProductoPorId=await productsModelo.findById(productId)

        res.status(200).json({encontrarProductoPorId})
     });

    productsRouter.put('/:id', async (req, res) => {
        try {
            const id = req.params.id;
            const modificarProduct = req.body;
    
            if (!modificarProduct.title) {
                return res.status(400).json({ error: 'Faltan datos' });
            }
    
            // Encuentra el producto por su ID y actualiza sus propiedades
            const productoModificado = await productsModelo.findByIdAndUpdate(
                id,
                modificarProduct,
                { new: true } // Esto hace que devuelva el producto actualizado en lugar del antiguo
            );
    
            if (!productoModificado) {
                return res.status(404).json({ error: `El producto con ID ${id} no existe` });
            }
    
            res.status(200).json({ productoModificado });
        } catch (error) {
            res.status(500).json({ error: 'Error al modificar el producto' });
        }
    });
    
     

    productsRouter.post('/', async (req, res) => {

        let product = req.body

        try{
            const productoExistente = await productsModelo.findOne({
                title:product.title,
                description:product.description
            })
            if(productoExistente) {
                res.status(400).json({error:"El Producto ya existe"})
            } else {
                const newProduct = await productsModelo.create(product)

                res.status(201).json({newProduct})
            }
            
            

        } catch(error) {
            res.status(500).json({ error: 'Error al agregar el producto' });
        }
        
    });

    productsRouter.delete('/:id', async (req, res) => {

        let id=req.params.id
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({error:'id invalido'})
        }
        let buscarProductoPorId= await productsModelo.findById(id)
        console.log(buscarProductoPorId)

        if(!buscarProductoPorId) {
            return res.status(404).json({error:`El usuario con este id ${id} no existe`})
        }
        let deleteProduct= await productsModelo.deleteOne({_id:id})
        

        res.status(200).json({deleteProduct})

     });

    return productsRouter;
};



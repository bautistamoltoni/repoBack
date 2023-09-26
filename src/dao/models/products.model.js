const mongoose = require('mongoose');

const productsCollection= 'products'
const productsEsquema= new mongoose.Schema({
    
    title: String,
    description: String,
    price: Number,
    code: String,
    stock: Number
},{strict:false})

 const productsModelo= mongoose.model(productsCollection, productsEsquema) 
 module.exports = productsModelo

const mongoose = require('mongoose');

const cartsCollection= 'carts'
const cartsEsquema= new mongoose.Schema({
        products: [
          {
            product: String,
            quantity: Number
          }
        ]
      
},{strict:false})

 const cartsModelo= mongoose.model(cartsCollection, cartsEsquema) 
 module.exports = cartsModelo
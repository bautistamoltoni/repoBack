const mongoose = require('mongoose');
const messageCollection = 'Message';
const messageSchema = new mongoose.Schema({
    user: String, 
    message: String, 
    createdAt: { type: Date, default: Date.now }
});

const MessageModelo = mongoose.model(messageCollection, messageSchema);

module.exports = MessageModelo;

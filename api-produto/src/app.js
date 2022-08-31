const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect("sua conexão aqui");

app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.use(function (req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, x-access-token' )
    next();
});

//registrar a model
require('./models/product');

//registrar a roda
const productRouter = require('./routes/product-route');
const index = require('./routes/index')

app.use('/', index);
app.use('/products', productRouter);

module.exports = app



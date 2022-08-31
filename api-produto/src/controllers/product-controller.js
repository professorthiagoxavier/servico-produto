const mongoose = require('mongoose');
const repository = require('../repositories/product-repository')


exports.get = async(req, res, next)=> {
    const data = await repository.getProduct();
    res.status(200).send(data);
}
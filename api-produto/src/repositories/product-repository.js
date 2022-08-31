const mongoose = require('mongoose');
const Product = mongoose.model('Product');


exports.getProduct = async () => {
    const result = await Product.find({}, 'title price _id active');

    return result;
}
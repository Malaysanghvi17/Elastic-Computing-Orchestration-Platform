const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{ 
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true,
        unique: true
    },
    password:{
        type: String,
        require: true,
        unique: true
    },
    timestamp:{
        type: Date,
        default: Date.now
    }
});
const user = mongoose.model('user', userSchema);
user.createIndexes();
module.exports = user;
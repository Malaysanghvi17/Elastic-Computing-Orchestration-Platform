const mongoose = require('mongoose');

const containerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    containerName: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    ram: {
        type: Number,
        required: true
    },
    cpus: {
        type: Number,
        required: true
    },
    storage: {
        type: String,
        required: true
    },
    sshPort: {
        type: Number,
        required: true
    },
    httpPort: {
        type: Number,
        required: true
    },
    passwd: {
        type: String,
        required: true
    }
});

const Container = mongoose.model('Container', containerSchema);

module.exports = Container;

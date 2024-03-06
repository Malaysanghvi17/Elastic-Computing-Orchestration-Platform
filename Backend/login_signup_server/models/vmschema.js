const mongoose = require('mongoose');

const vmSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    vmName: {
        type: String,
        required: true,
    },
    vmPort: {
        type: Number,
        required: true,
    }
});

const vmschema = mongoose.model('uservms', vmSchema);
module.exports = vmschema;

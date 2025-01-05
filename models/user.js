const mongoose = require('mongoose');

let usersSchema = new mongoose.Schema({
    login: {
        type: String,
        required: [true, 'El login es obligatori'],
        unique: true,
        minlength: [4, 'El login es massa curt'],
    },
    password: {
        type: String,
        required: [true, 'La contrasenya es obligatoria'],
        minlength: [7, 'La contrasenya es massa curta']
    },
    rol: {
        type: String,
        required: true,
        emum: ['admin', 'physio', 'patient']
    }
});

let User = mongoose.model('users', usersSchema);
module.exports = User;
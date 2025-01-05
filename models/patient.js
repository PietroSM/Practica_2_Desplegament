const mongoose = require('mongoose');

let patientsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nom del patient es obligatori'],
        minlength: [2, 'El nom del patient es massa curt'],
        maxlength: [50, 'El nom del patient es massa llarg']
    },
    surname: {
        type: String,
        required: [true, 'El cognom del patient es obligatori'],
        minlength: [2, 'El cognom del patient es massa curt'],
        maxlength: [50, 'El cognom del patient es massa llarg']
    },
    birthDate: {
        type: Date,
        required: [true, 'La data de naiximent del patient es obligatori'],
    },
    address: {
        type: String,
        required: [true, 'La adreça del patient es obligatori'],
        maxlength: [100, 'La adreça del patient es massa llarga']
    },
    insuranceNumber: {
        type: String,
        match:[ /^[A-Za-z0-9]{9}$/, 'Soles pot contindre lletres, numeros i un tamany de 9'],
        unique: true
    },
    image: {
        type: String,
    }
});

let Patient = mongoose.model('patients', patientsSchema);
module.exports = Patient;
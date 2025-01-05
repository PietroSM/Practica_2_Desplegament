const mongoose = require('mongoose');

let physiosSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nom es obligatori'],
        minlength: [2, 'El nom es massa curt'],
        maxlength: [50, 'El nom es massa llarg']
    },
    surname: {
        type: String,
        required: [true, 'El cognom es obligatori'],
        minlength: [2, 'El cognom es massa curt'],
        maxlength: [50, 'El cognom es massa llarg']
    },
    specialty: {
        type: String,
        required: [true, 'L\'especialitat es obligatoria'],
        enum: ['Sports', 'Neurological', 'Pediatric', 'Geriatric', 'Oncological'],
    },
    licenseNumber: {
        type: String,
        required: [true, 'El numero de licencia es obligatori'],
        match: [/^[A-Za-z0-9]{8}$/, 'Soles pot contindre lletres, numero i un tamany de 8'],
        unique: true,
    },
    image: {
        type: String,
        required: false
    }
});


let Physio = mongoose.model('physios', physiosSchema);
module.exports = Physio;
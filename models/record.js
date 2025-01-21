const mongoose = require('mongoose');


let appointmentsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, 'La data es obligatoria']
    },
    physio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'physios',
        required: [true, 'El id del physio es obligatori']
    },
    diagnosis: {
        type: String,
        required: [true, 'El diagnosis es obligatori'],
        minlength: [10, 'El diagnosis es massa curt'],
        maxlength: [500, 'El diagnosis es massa llarg']
    },
    treatment: {
        type: String,
        required: [true, 'El tractament es obligatori']
    },
    observations: {
        type: String,
        maxlength: [500, 'La observació es massa llarga']
    }
});



let recordSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'patients',
        required: [true, 'El id del patient es obligatori'],
        unique: true
    },
    medicalRecord: {
        type: String,
        maxlength: [1000, 'El medical record es massa llarg']
    },
    appointments: [appointmentsSchema]
});

let Record = mongoose.model('records', recordSchema);
let Appointment = mongoose.model('appointments', appointmentsSchema);
module.exports = {
    Record,
    Appointment
};
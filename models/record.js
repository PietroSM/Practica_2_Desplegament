const mongoose = require('mongoose');


let appointmentsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    physio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'physios',
        required: true
    },
    diagnosis: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500
    },
    treatment: {
        type: String,
        required: true
    },
    observations: {
        type: String,
        maxlength: 500
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
const express = require('express');

const { Appointment, Record } = require(__dirname + "/../models/record.js");
let Patient = require(__dirname + "/../models/patient.js");
const User = require(__dirname + '/../models/user.js');
let router = express.Router();
const upload = require(__dirname + '/../utils/uploads.js');

//Obtindre tots els expedients mèdics.
router.get('/', async (req, res) => {
    try{
        const resultat = await Record.find().populate('patient');

        if(resultat.length > 0){
            res.render('records_list', { records: resultat});
        }else{
            res.render('error', {error: "No hi ha expedients mèdics en el sistema"});
        }
    }catch (error){
        res.render('error', {error: "Error obtenint expedients mèdics"});
    }
});


//Formulari nou record
router.get('/new', (req, res) => {
    res.render('record_add');
});

//Formulari nova cita
router.get('/:id/appointments/new', (req, res) => {
    res.render('record_appointment_add', {id: req.params.id});
});




//Buscar expedients per nom de pacient.
router.get('/find', async(req, res) => {
    try{
        const resultatPatient = await
        Patient.find({
            $or: [
                { surname: { $regex: req.query.surname, $options: 'i' } },
                { name: { $regex: req.query.surname, $options: 'i' } }
            ]
        });

        let idsPatients = resultatPatient.map(p=>p._id);
        const resultatRecord = await Record.find({patient : {$in: idsPatients}}).populate('patient');
        
    
        if(resultatRecord.length > 0){
            res.render('records_list', { records: resultatRecord});
        }else{
            res.render('error',{error: "No es van trobar expedients associats al" +
                "cognom ingressat."});        }
    }catch (error){
        res.status(500).send({error: "Error buscant el expedient indicat"});
    }
});


//Obtindre detalls d'un expedient especific.
router.get('/:id', async (req, res) => {
    try{
        const resultat = await Record.findById(req.params.id).populate('patient');
        if(resultat){
            res.render('record_detail', { record: resultat});
        }else{
            res.render('error',{error: "No hi ha expedient amb aquests criteris"});
        }
    } catch (error){
        res.render('render', {error: "Error buscant el record indicat"});
    }
});


//Inserir un expedient mèdic.
router.post('/', upload.upload.single(), async (req, res) => {
    try{
        let nouRecords = new Record({
            patient: req.body.patient,
            medicalRecord: req.body.medicalRecord
        });

        console.log(req.body.medicalRecord);

        const resultat = await nouRecords.save();
        res.redirect(req.baseUrl);
    }catch (error){
        let errors = {
            general: 'Error al inserir un expedient'
        };
        if(error.errors.patient){
            errors.patient = error.errors.patient.message;
        }
        if(error.errors.medicalRecord){
            errors.medicalRecord = error.errors.medicalRecord.message;
        }

        res.render('record_add', {errors: errors, dades: req.body});
    }
});


//Afegir consultes a un expedient.
router.post('/:id/appointments', async (req, res) => {
    try{
        let nouAppointment = new Appointment({
            date : new Date(req.body.date),
            physio: req.body.physio,
            diagnosis: req.body.diagnosis,
            treatment:req.body.treatment,
            observations: req.body.observations
        });
    
        const AfegirAppointment = await Record.findOneAndUpdate(
            {patient: req.params.id},
            { $push: { appointments: nouAppointment } },
            { new: true }
        );

        if(!AfegirAppointment){
            res.status(404).send({error: "No s'ha trobat expedient"});
        }
        res.status(201).send({result: AfegirAppointment});
    }catch (error){
        res.status(500).send({error: "Error al afegir la cita"});
    }
});


//Eliminar un expedient medic.
router.delete('/:id', async (req, res) => {
    try{
        const resultat = await Record.findOnedAndDelete({patient: req.params.id});
        if(resultat){
            res.status(200).send({result: resultat});
        }else{
            res.status(404).send({result: "Error, no es troba el Expedient"});
        }
    }catch (error){
        res.status(500).send({error: "Error Servidor"});
    }
});



module.exports = router;
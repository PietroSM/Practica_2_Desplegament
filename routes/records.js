const express = require('express');

const { Appointment, Record } = require(__dirname + "/../models/record.js");
let Patient = require(__dirname + "/../models/patient.js");
const User = require(__dirname + '/../models/user.js');
let router = express.Router();
const upload = require(__dirname + '/../utils/uploads.js');
const auth = require(__dirname + '/../utils/auth.js');



//Obtindre tots els expedients mèdics. ✔
router.get('/', auth.autenticacio, auth.rol(["admin", "physio"]), async (req, res) => {
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


//Formulari nou record. ✔
router.get('/new', auth.autenticacio, auth.rol(["admin", "physio"]), (req, res) => {
    res.render('record_add');
});


//Formulari nou record amb id. ✔
router.get('/new/:id', auth.autenticacio, auth.rol(["admin", "physio"]), (req, res) => {
    res.render('record_add', {dades: {
        patient: req.params.id
    }});
});


//Formulari nova cita. ✔
router.get('/:id/appointments/new', auth.autenticacio, auth.rol(["admin", "physio"]), (req, res) => {
    res.render('record_appointment_add', {id: req.params.id});
});


//Buscar expedients per nom de pacient. ✔
router.get('/find', auth.autenticacio, auth.rol(["admin", "physio"]), async(req, res) => {
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
                "cognom ingressat."});        
        }
    }catch (error){
        res.render('error',{error: "Error buscant el expedient indicat"});
    }
});


//Obtindre detalls d'un expedient especific. ✔
router.get('/:id', auth.autenticacio, auth.rol(["patient","admin", "physio"]), async (req, res) => {
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


//Inserir un expedient mèdic. ✔
router.post('/', upload.upload.single(),auth.autenticacio, auth.rol(["patient","admin", "physio"]), async (req, res) => {
    try{
        let nouRecords = new Record({
            patient: req.body.patient,
            medicalRecord: req.body.medicalRecord
        });

        const resultat = await nouRecords.save();
        res.redirect(req.baseUrl);
    }catch (error){
        let errors = {
            general: 'Error al inserir un expedient'
        };

        if(error.code === 11000){
            if(error.keyPattern.patient){
                errors.patient = 'Aquest patient ja existeix amb expedient.';
            }
        }

        if(error.errors.patient){
            errors.patient = "La id de patient es obligatoria i ha d\'existir.";
        }
        if(error.errors.medicalRecord){
            errors.medicalRecord = error.errors.medicalRecord.message;
        }

        res.render('record_add', {errors: errors, dades: req.body});
    }
});


//Afegir consultes a un expedient. ✔
router.post('/:id/appointments', upload.upload.single(), auth.autenticacio, auth.rol(["admin", "physio"]), async (req, res) => {
    try{
        let nouAppointment = new Appointment({
            date : req.body.date,
            physio: req.body.physio,
            diagnosis: req.body.diagnosis,
            treatment:req.body.treatment,
            observations: req.body.observations
        });
        
        await nouAppointment.validate();

        const AfegirAppointment = await Record.findOneAndUpdate(
            {patient: req.params.id},
            { $push: { appointments: nouAppointment } },
            { new: true }
        );

        if(AfegirAppointment){
            res.redirect('/records/'+AfegirAppointment.id);
        }


    }catch (error){
        let errors = {
            general: 'Error al afegir la cita'
        };

        if(error.errors.date){
            errors.date = error.errors.date.message;
        }
        if(error.errors.physio){
            errors.physio = 'Id no valid';
        }
        if(error.errors.diagnosis){
            errors.diagnosis = error.errors.diagnosis.message;
        }
        if(error.errors.treatment){
            errors.treatment = error.errors.treatment.message;
        }
        if(error.errors.observations){
            errors.observations = error.errors.observations.message;
        }

        res.render('record_appointment_add', 
            {
                errors: errors, 
                dades: req.body, 
                id: req.params.id,
            }
        );
    }
});


//Eliminar un expedient medic.
router.delete('/:id', auth.autenticacio, auth.rol(["admin", "physio"]), async (req, res) => {
    try{
        await Record.findByIdAndDelete(req.params.id);
        res.redirect(req.baseUrl);
    }catch (error){
        res.render('error', {error: "Error esborrant Record"});
    }
});



module.exports = router;
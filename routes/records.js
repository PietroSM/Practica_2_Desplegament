const express = require('express');

const { Appointment, Record } = require(__dirname + "/../models/record.js");
let Patient = require(__dirname + "/../models/patient.js");
const User = require(__dirname + '/../models/user.js');
let router = express.Router();


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
        const resultatRecord = await Record.find({patient : {$in: idsPatients}});
        
    
        if(resultatRecord.length > 0){
            res.status(200).send({result: resultatRecord});
        }else{
            res.status(404).send({error: "No hi ha expedients amb aquests criteris"});
        }
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
router.post('/', async (req, res) => {
    try{
        let nouRecords = new Record({
            patient: req.body.patient,
            medicalRecord: req.body.medicalRecord
        });

        const resultat = await nouRecords.save();
        res.status(201).send({result: resultat});
    }catch (error){
        res.status(400).send({result:"Error al inserir un expedient"});
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
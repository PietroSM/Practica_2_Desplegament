const express = require('express');
const bcrypt = require('bcrypt');

let Patient = require(__dirname + "/../models/patient.js");
const User = require(__dirname + '/../models/user.js');
let router = express.Router();
const upload = require(__dirname + '/../utils/uploads.js');


//Llistat de tots els pacients.
router.get('/', async (req, res) => {
    try{
        const resultat = await Patient.find();

        if(resultat.length > 0){
            res.render('patients_list', { patients: resultat});
        }else{
            res.render('error' ,{error: "No hi ha pacients en el sistema"});
        }
    } catch (error){
        res.render('error' ,{error: "Error obtenint pacients"});
    }
});


//Formulari nou patient
router.get('/new', (req, res) => {
    res.render('patient_add');
});



//Buscar Pacients per nom o cognoms.
router.get('/find', async(req, res) => {
    try{
        const resultat = await
        Patient.find({
            surname: { $regex: req.query.surname, $options: 'i' }
        });
    
        if(resultat.length > 0){
            res.status(200).send({result: resultat});
        }else{
            res.status(404).send({result: "No hi ha pacients amb aquests criteris"});
        }
    }catch (error){
        res.status(500).send({error: "Error buscant el pacient indicat"});
    }
});


//Formulari modificar pacient.
router.get('/:id/edit', async(req, res) => {
    try{
        const resultat = await Patient.findById(req.params['id']);

        if(resultat){
            const dataAux = resultat.birthDate.toLocaleDateString('en-CA');
            res.render('patient_edit', {patient: resultat, data:dataAux});
        }else{
            res.render('error', {error: "Patient no trobat"});
        }

    }catch(error){
        res.render('error', {error: "Patient no trobat"});
    }
});


//Detalls d'un pacient especific.
router.get('/:id', async (req, res) =>{
    try{
        const resultat = await Patient.findById(req.params.id);
        if(resultat){
            res.render('patient_detail', { patient: resultat});
        }else{
            res.render('error', {error: "No hi ha pacients amb aquests criteris de cognom"});
        }
    } catch (error){
        res.render('error', {error: "Error buscant el pacient indicat"});
    }
});


//Insertar un pacient.
router.post('/', upload.upload.single('image'), async (req, res) =>{
    try{
        // const hash = bcrypt.hashSync(req.body.password, 10);

        // let nouUsuari = new User({
        //     login: req.body.login,
        //     password: hash,
        //     rol: "patient"
        // });

        let nouUsuari = new User({
            login: req.body.login,
            password: req.body.password,
            rol: "patient"
        });

        const resultatUsuari = await nouUsuari.save();
        const idUsuari = resultatUsuari._id;

        let nouPatient = new Patient({
            _id: idUsuari,
            name: req.body.name,
            surname: req.body.surname,
            birthDate: req.body.birthDate,
            address: req.body.address,
            insuranceNumber: req.body.insuranceNumber
        });


        if(req.file){
            nouPatient.image = req.file.filename;
        }

        const resultat = await nouPatient.save();
        res.redirect(req.baseUrl);
        
    }catch(error){
        console.log(error);
        let errors = {
            general: 'Error insertant pacient'
        };
        if(error.errors.name){
            errors.name = error.errors.name.message;
        }
        if(error.errors.surname){
            errors.surname = error.errors.surname.message;
        }
        if(error.errors.birthDate){
            errors.birthDate = error.errors.birthDate.message;
        }
        if(error.errors.address){
            errors.address = error.errors.address.message;
        }
        if(error.errors.insuranceNumber){
            errors.insuranceNumber = error.errors.insuranceNumber.message;
        }
        if(error.errors.login){
            errors.login = error.errors.login.message;
        }
        if(error.errors.password){
            errors.password = error.errors.password.message;
        }

        res.render('patient_add', {errors: errors, dades: req.body});
    }
});






//Actualitza les dades a un pacient.
router.post('/:id', upload.upload.single('image'), async(req, res) => {
    try{
        const resultatPatient = await Patient.findById(req.params.id);

        if(resultatPatient){
            resultatPatient.name = req.body.name;
            resultatPatient.surname = req.body.surname;
            resultatPatient.birthDate = req.body.birthDate;
            resultatPatient.address = req.body.address;
            resultatPatient.insuranceNumber = req.body.insuranceNumber;

            if(req.file){
                resultatPatient.image = req.file.filename;
            }

            const resultat = await resultatPatient.save();
            res.redirect("/patients/"+resultat.id);
        }else{
            res.render('error', {error: "Patient no trobat"});
        }

    }catch(error){
        console.log(error);
        let errors = {
            general: 'Error insertant pacient'
        };
        if(error.errors.name){
            errors.name = error.errors.name.message;
        }
        if(error.errors.surname){
            errors.surname = error.errors.surname.message;
        }
        if(error.errors.birthDate){
            errors.birthDate = error.errors.birthDate.message;
        }
        if(error.errors.address){
            errors.address = error.errors.address.message;
        }
        if(error.errors.insuranceNumber){
            errors.insuranceNumber = error.errors.insuranceNumber.message;
        }
        
        res.render('patient_edit', {errors: errors, dades: {
            id: req.params.id,
            name: req.body.name,
            surname: req.body.surname,
            birthDate: req.body.birthDate,
            address: req.body.address,
            insuranceNumber: req.body.insuranceNumber
        }});
    }
});





// router.put('/:id', async (req, res) => {
//     try{

//         const resultat = await Patient.findByIdAndUpdate(req.params.id, {
//             $set: {
//                 name: req.body.name,
//                 surname: req.body.surname,
//                 birthDate: new Date(req.body.birthDate),
//                 address: req.body.address,
//                 insuranceNumber: req.body.insuranceNumber 
//             }}, {new: true});
        
//         if(resultat){
//             res.status(200).send({result: resultat});
//         }else{
//             res.status(400).send({result: "Error, no es troba el pacient"});
//         }
//     } catch(error){
//         res.status(500).send({error: "Error Servidor"});
//     }
// });



module.exports = router;
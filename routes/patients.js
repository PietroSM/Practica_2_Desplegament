const express = require('express');
const bcrypt = require('bcrypt');

let Patient = require(__dirname + "/../models/patient.js");
const User = require(__dirname + '/../models/user.js');
const upload = require(__dirname + '/../utils/uploads.js');
const auth = require(__dirname + '/../utils/auth.js');
let router = express.Router();

//Llistat de tots els pacients. ✔
router.get('/',  auth.autenticacio, auth.rol(["admin", "physio"]), async (req, res) => {
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


//Formulari nou patient ✔
router.get('/new', auth.autenticacio, auth.rol(["admin", "physio"]), (req, res) => {
    res.render('patient_add');
});


//Buscar Pacients per nom o cognoms. ✔
router.get('/find', auth.autenticacio, auth.rol(["admin", "physio"]), async(req, res) => {
    try{
        const resultat = await
        Patient.find({
            surname: { $regex: req.query.surname, $options: 'i' }
        });
    
        if(resultat.length > 0){
            res.render('patients_list', { patients: resultat});
        }else{
            res.render('patients_list');
        }
    }catch (error){
        res.render('error', {error: "Va haver-hi un problema en processar la" +
            "busca. Intente-ho més tard "});
    }
});


//Esborrar el Patient. ✔
router.delete('/:id',auth.autenticacio, auth.rol(["admin", "physio"]), async (req, res) => {
    try{
        await Patient.findByIdAndDelete(req.params.id);
        await User.findByIdAndDelete(req.params.id);
        res.redirect(req.baseUrl);
    }catch {
        res.render('error', {error: "Error esborrant Patient"});
    }
});


//Formulari modificar pacient. ✔
router.get('/:id/edit', auth.autenticacio, auth.rol(["admin", "physio"]), async(req, res) => {
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


//Detalls d'un pacient especific. ✔
router.get('/:id', auth.autenticacio, auth.rol(["patient","admin", "physio"]), async (req, res) =>{
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


//Insertar un pacient. ✔
router.post('/', upload.upload.single('image'), auth.autenticacio, auth.rol(["admin", "physio"]), async (req, res) =>{
    let idUsuari = null;
    try{
        const hash = bcrypt.hashSync(req.body.password, 10);

        let nouUsuari = new User({
            login: req.body.login,
            password: hash,
            rol: "patient"
        });

        const resultatUsuari = await nouUsuari.save();
        idUsuari = resultatUsuari._id;

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
        
    }catch (error){

        if (idUsuari) {
            await User.findByIdAndDelete(idUsuari);
        }

        let errors = {
            general: 'Error insertant pacient'
        };

        if(error.code === 11000){
            if(error.keyPattern.login){
                errors.login = 'Aquest login ja existeix.';
            }else if(error.keyPattern.insuranceNumber){
                errors.insuranceNumber = 'Aquest insuranceNumber ja existeix';
            }
        }else if(error.errors){

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
        }

        res.render('patient_add', {errors: errors, dades: req.body});
    }
});


//Actualitza les dades a un pacient. ✔
router.post('/:id', upload.upload.single('image'), auth.autenticacio, auth.rol(["admin", "physio"]), async(req, res) => {
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
        let errors = {
            general: 'Error Editant pacient'
        };

        if(error.code === 11000){
            if(error.keyPattern.insuranceNumber){
                errors.insuranceNumber = 'Aquest insuranceNumber ja existeix';
            }
        }else if( error.errors){
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
        }
        
        res.render('patient_edit', {errors: errors, patient: {
            id: req.params.id,
            name: req.body.name,
            surname: req.body.surname,
            address: req.body.address,
            insuranceNumber: req.body.insuranceNumber
        }, data:req.body.birthDate
    });
    }
});



module.exports = router;
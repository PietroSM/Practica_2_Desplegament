const express = require('express');
const bcrypt = require('bcrypt');

let Physio = require(__dirname + "/../models/physio.js");
const User = require(__dirname + '/../models/user.js');
let router = express.Router();
const upload = require(__dirname + '/../utils/uploads.js');
const auth = require(__dirname + '/../utils/auth.js');


//Llistat de tots els fisioterapeutes. ✔
router.get('/', auth.autenticacio, async (req, res) => {
    try{
        const resultat = await Physio.find();

        if(resultat.length > 0){
            res.render('physios_list', { physios: resultat});
        }else{
            res.render('error', {error: "No hi ha fisioterapeutes en el sistema"});
        }
    } catch (error){
        res.render('error', {error: "Error obtenint fisioterapeutes"});
    }
});


//Formulari nou physio. ✔
router.get('/new', auth.autenticacio, auth.rol(["admin"]), (req, res) => {
    res.render('physio_add');
});


//Buscar fisioterapeutes per especialitats. ✔
router.get('/find', auth.autenticacio, async (req, res) =>{
    try{
        const resultat = await Physio.find({
            specialty: { $regex: req.query.specialty, $options: 'i' }
        });

        if(resultat.length > 0){
            res.render('physios_list', { physios: resultat});
        }else{
            res.render('error',{error: "No es van trobar"+
                    "fisioterapeutes amb l'especialitat indicada."});
        }
    }catch (error){
        res.render('error', {error: "Error buscant el fisioterapeutes indicat"});
    }
});


//Formulari modificar physio. ✔
router.get('/:id/edit',  auth.autenticacio, auth.rol(["admin"]), async(req, res) => {
    try{
        const resultat = await Physio.findById(req.params['id']);

        if(resultat){
            res.render('physio_edit', {physio: resultat});
        }else{
            res.render('error', {error: "Physio no trobat"});
        }

    }catch(error){
        res.render('error', {error: "Physio no trobat"});
    }
});


//Detalls d'un fisioterapeuta especific. ✔
router.get('/:id', auth.autenticacio, async (req, res) => {
    try{
        const resultat = await Physio.findById(req.params.id);
        if(resultat){
            res.render('physio_detail', { physio: resultat});
        }else{
            res.render('error', {error: "No hi ha fisioterapeutes amb aquests criteris de cognom"});
        }
    } catch (error){
        res.render('error', {error: "Error buscant el fisioterapeutes indicat"});
    }
});


//Insertar un fisioterapeuta. ✔
router.post('/', upload.upload.single('image'), auth.autenticacio, auth.rol(["admin"]), async (req, res) =>{
    let idUsuari = null;
    try{
        const hash = bcrypt.hashSync(req.body.password, 10);

        let nouUsuari = new User({
            login: req.body.login,
            password: hash,
            rol: "physio"
        });

        const resultatUsuari = await nouUsuari.save();
        idUsuari = resultatUsuari._id;

        let nouPhysio = new Physio({
            _id: idUsuari,
            name: req.body.name,
            surname: req.body.surname,
            specialty: req.body.specialty,
            licenseNumber: req.body.licenseNumber
        });

        if(req.file){
            nouPhysio.image = req.file.filename;
        }

        const resultat = await nouPhysio.save();
        res.redirect(req.baseUrl);
    }catch(error){
        if (idUsuari) {
            await User.findByIdAndDelete(idUsuari);
        }

        let errors = {
            general: 'Error al inserir un fisioterapeuta'
        };

        if(error.code === 11000){
            if(error.keyPattern.login){
                errors.login = 'Aquest login ja existeix.';
            }else if(error.keyPattern.licenseNumber){
                errors.licenseNumber = 'Aquest licenseNumber ja existeix';
            }
        }else if(error.errors){
            if(error.errors.name){
                errors.name = error.errors.name.message;
            }
            if(error.errors.surname){
                errors.surname = error.errors.surname.message;
            }
            if(error.errors.specialty){
                errors.specialty = error.errors.specialty.message;
            }
            if(error.errors.licenseNumber){
                errors.licenseNumber = error.errors.licenseNumber.message;
            }
            if(error.errors.login){
                errors.login = error.errors.login.message;
            }
            if(error.errors.password){
                errors.password = error.errors.password.message;
            }
        }

        res.render('physio_add', {errors: errors, dades: req.body});
    }
});

//Actualitza les dades a un physio. ✔
router.post('/:id', upload.upload.single('image'), auth.autenticacio, auth.rol(["admin"]), async(req, res) => {
    try{
        const resultatPhysio = await Physio.findById(req.params.id);

        if(resultatPhysio){
            resultatPhysio.name = req.body.name;
            resultatPhysio.surname = req.body.surname;
            resultatPhysio.specialty = req.body.specialty;
            resultatPhysio.licenseNumber = req.body.licenseNumber;

            if(req.file){
                resultatPhysio.image = req.file.filename;
            }

            const resultat = await resultatPhysio.save();
            res.redirect("/physios/"+resultat.id);
        }else{
            res.render('error', {error: "Physio no trobat"});
        }

    }catch(error){

        let errors = {
            general: 'Error al Editant un fisioterapeuta'
        };

        if(error.code === 11000){
            if(error.keyPattern.licenseNumber){
                errors.licenseNumber = 'Aquest licenseNumber ja existeix';
            }
        }else if(error.errors){
            if(error.errors.name){
                errors.name = error.errors.name.message;
            }
            if(error.errors.surname){
                errors.surname = error.errors.surname.message;
            }
            if(error.errors.specialty){
                errors.specialty = error.errors.specialty.message;
            }
            if(error.errors.licenseNumber){
                errors.licenseNumber = error.errors.licenseNumber.message;
            }
        }

        res.render('physio_edit', {errors: errors, physio: {
            id: req.params.id,
            name: req.body.name,
            surname: req.body.surname,
            specialty: req.body.specialty,
            licenseNumber: req.body.licenseNumber
        }});
    }
});


//Esborrar un fisioterapeuta. ✔
router.delete('/:id', async (req, res) => {
    try{
        await Physio.findByIdAndDelete(req.params.id);
        await User.findByIdAndDelete(req.params.id);
        res.redirect(req.baseUrl);
    }catch (error){

    }
});



module.exports = router;
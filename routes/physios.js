const express = require('express');

let Physio = require(__dirname + "/../models/physio.js");
const User = require(__dirname + '/../models/user.js');
let router = express.Router();


//Llistat de tots els fisioterapeutes.
router.get('/', async (req, res) => {
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

//Formulari nou pacient
router.get('/new', (req, res) => {
    res.render('physio_add');
});

//Buscar fisioterapeutes per especialitats.
router.get('/find', async (req, res) =>{
    try{
        const resultat = await Physio.find({
            specialty: { $regex: req.query.specialty, $options: 'i' }
        });

        if(resultat.length > 0){
            res.status(200).send({result: resultat});
        }else{
            res.status(404).send({error: "No hi ha fisioterapeutes amb aquests criteris"});
        }
    }catch (error){
        res.status(500).send({error: "Error buscant el fisioterapeutes indicat"});
    }
});


//Detalls d'un fisioterapeuta especific.
router.get('/:id', async (req, res) => {
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


//Insertar un fisioterapeuta.
router.post('/', upload.upload.single('image'), async (req, res) =>{
    try{
        let nouUsuari = new User({
            login: req.body.login,
            password: req.body.password,
            rol: "physio"
        });

        const resultatUsuari = await nouUsuari.save();
        const idUsuari = resultatUsuari._id;

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
        let errors = {
            general: 'Error al inserir un fisioterapeuta'
        };
        if(error.errors.name){
            errors.name = error.errors.name.message;
        }
        if(error.errors.surname){
            errors.surname = error.errors.surname.message;
        }
        

    }
});


//Actualitza les dades a un fisioterapeuta.
router.put('/:id', async (req, res) => {
    try{

        const resultat = await Physio.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                surname: req.body.surname,
                specialty: req.body.specialty,
                licenseNumber: req.body.licenseNumber
            }}, {new: true});
        
        if(resultat){
            res.status(200).send({result: resultat});
        }else{
            res.status(400).send({result: "Error, no es troba el fisioterapeuta"});
        }
    } catch(error){
        res.status(500).send({error: "Error Servidor"});
    }
});


//Eliminar un fisioterapeuta.
router.delete('/:id', async (req, res) => {
    try{
        const resultat = await Physio.findByIdAndDelete(req.params.id);

        if(resultat){
            res.status(200).send({result: resultat});
        }else{
            res.status(404).send({result: "Error, no es troba el fisioterapeuta"});
        }
    }catch (error){
        res.status(500).send({error: "Error Servidor"});
    }
});



module.exports = router;
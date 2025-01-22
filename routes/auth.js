const express = require('express');
const upload = require(__dirname + '/../utils/uploads.js');
let router = express.Router();
const bcrypt = require('bcrypt');
const User = require(__dirname + '/../models/user.js');


router.get('/login', (req, res) => {
    res.render('login')
});



router.post('/login', upload.upload.single(), async (req, res) => {
    let login = req.body.login;
    let password = req.body.password;

    let existeixUsuari = await User.findOne({
        login: login
    });

    if(existeixUsuari && bcrypt.compareSync(password, existeixUsuari.password)){
        req.session.login = existeixUsuari.login;
        req.session.rol = existeixUsuari.rol;
        res.redirect('/patients');
    } else {
        res.render('login', {error: "Usuari o contrasenya incorrectes"});
    }
});


router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
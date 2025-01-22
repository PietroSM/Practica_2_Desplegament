const express = require('express');
const mongoose = require('mongoose');
const nunjucks = require('nunjucks');
const session = require('express-session');

// Encaminadors
const patients = require(__dirname+"/routes/patients");
const physios = require(__dirname+"/routes/physios");
const records = require(__dirname+"/routes/records");
const auth = require(__dirname+"/routes/auth");

mongoose.connect(process.env.DB);

let app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app,
});



app.set('view engine', 'njk');

app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

app.use(express.json());

app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));

app.use('/', express.static('public'));
app.use('/auth', auth);
app.use('/patients', patients);
app.use('/physios', physios);
app.use('/records', records);

app.listen(process.env.PORT);
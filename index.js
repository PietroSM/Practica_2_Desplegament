const express = require('express');
const mongoose = require('mongoose');
const nunjucks = require('nunjucks')

// Encaminadors
const patients = require(__dirname+"/routes/patients");
const physios = require(__dirname+"/routes/physios");
const records = require(__dirname+"/routes/records");

mongoose.connect(process.env.DB);

let app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app,
});



app.set('view engine', 'njk');
app.use(express.json());

app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));

app.use('/public', express.static('public'));
app.use('/patients', patients);
app.use('/physios', physios);
app.use('/records', records);

app.listen(process.env.PORT);
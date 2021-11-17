const express = require('express');
const ejs = require('ejs');
const formidable = require('formidable');
const multipart = require('connect-multiparty')
const multipartMiddleware = multipart()
const path = require('path')
const os = require('os')
const fs = require('fs')
    //const bodyparser=require('body-parser');

//app.use(bodyparser.urlencoded({extended:true}));
const app = express();
app.use(express.json());
app.use(express.urlencoded());

app.use(express.static("public"));
app.set("view engine", ejs);

app.get("/", function(req, res) {
    res.render("index.ejs");
});
app.get("/review", function(req, res) {
    res.render("review.ejs");
});
app.get("/register", function(req, res) {
    res.render("register.ejs");
});
app.get("/record", function(req, res) {
    res.render("record.ejs");
});
app.get("/participants", function(req, res) {
    res.render("participants.ejs");
});
app.post("/", function(req, res) {
    const n1 = req.body.n1;
    console.log(n1);
});
var num = 1;
app.post('/uploadvideo', multipartMiddleware, function(req, res) {
    console.log('files', req.files.data)
    let fileName = 'upload' + num + '.webm'
    num = num + 1;
    let location = path.join(__dirname + '/public/recordings', fileName)
    fs.rename(req.files.data.path, location, function(err) {
        if (err) console.log('ERROR: ' + err);
    });
    console.log(`upload successful, file written to ${location}`)
    res.send(`upload successful, file written to ${location}`)
});
app.listen(process.env.PORT || 3000, function() {
    console.log("Server running");
});
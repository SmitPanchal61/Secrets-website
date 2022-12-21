//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// plugins necessary to encrypt
// it encrypts when save() is run and decrypts when find() is run so no need to change any more existing code that queries the database.
// code should be included before creating a model for that schema

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] })

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res) {
    res.render("home");
})

app.get("/login", function(req, res) {
    res.render("login");
})

app.get("/register", function(req, res) {
    res.render("register");
})

app.post("/register", function(req, res) {

    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function(err) {
        if(err) {
            console.log(err);
        }
        else {
            res.render("secrets");
        }
    });
})

app.post("/login", function(req, res) {

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, function(err, foundUser) {
        if(err) {
            console.log(err);
        }
        else {
            if(foundUser) {
                if(foundUser.password === password) {
                    res.render("secrets");
                }
                else {
                    res.send("Wrong Password!");
                }
            }
            else {
                res.send("No Users Found!")
            }
        }
    })
})



app.listen(3000, function() {
    console.log("Server started on port 3000.");
})
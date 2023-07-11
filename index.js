const dotenv = require('dotenv')
dotenv.config();
const mongoose = require('mongoose');
mongoose.connect(process.env.mongo);
const express = require('express');
const app = express();
const session = require("express-session")
const nocache = require ("nocache")



//================= SESSION ===============

app.use(
    session({
		secret: process.env.secret,
		saveUninitialized: true,
		resave: false,
        //  cookie:{
          //  maxAge: 604800000,
       // },
    })
);
app.use(nocache())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const path =require('path')
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));


//====for user routes===

const userRoute = require('./routes/userRoutes');
app.use('/', userRoute);

//=====for admin=======

const adminRoute = require('./routes/adminRoutes');
app.use('/admin', adminRoute);

//============ PORT ===========

app.listen(process.env.portnumber, () => {
	console.log("Server connected on port 5000")
})
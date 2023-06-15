const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/lilac');

const express = require('express');
const app = express();
const path = require('path');

const morgan = require('morgan');
// app.use(morgan('tiny'))

//dmin_route.set('view engine','ejs')

app.use(express.static(path.join(__dirname, 'public')));

//for user routes

const userRoute = require('./routes/userRoutes');
app.use('/', userRoute);

//for admin

const adminRoute = require('./routes/adminRoutes');
app.use('/admin', adminRoute);

app.listen(4000, function () {
	console.log('Server running');
});
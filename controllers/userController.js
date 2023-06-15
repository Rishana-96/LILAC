const User = require('../Model/userModel');
const bcrypt = require('bcrypt');
const productmodel = require('../Model/productModel');
const nodemailer = require('nodemailer');

let message;

const securePassword = async (password) => {
	try {
		const passwordHash = await bcrypt.hash(password, 10);
		return passwordHash;
	} catch (err) {
		console.log(err.message);
	}
};

const verifyLogin = async (req, res) => {
	try {
		const email = req.body.email;
		const password = req.body.password;

		const userData = await User.findOne({ email: email });

		if (userData) {
			const passwordMatch = await bcrypt.compare(password, userData.password);

			if (passwordMatch) {
				if (userData.is_admin === 0) {
					if (userData.is_block == true) {
						res.render('login', { message: 'YOU ARE BLOCKED BY ADMIN' });
					} else {
						req.session.user_id = userData._id;

						res.redirect('/home');
					}
				} else {
					res.render('login', { message: 'Email or password is incorrect' });
				}
			} else {
				res.render('login', { message: 'Email or password is incorrect' });
			}
		} else {
			res.render('login', {
				message: 'Please provide your correct Email and password ',
			});
		}
	} catch (error) {
		console.log(error.message);
	}
};
const loadHome = async (req, res) => {
	try {
		if (req.session.user_id) {
			const session = req.session.user_id;
			const userData = await User.findById({ _id: req.session.user_id });
			
			res.render('home', {
				userData: userData,
				session: session,
			});
		} else {
			const session = null;
			res.render('home', { session });
		}
	} catch (error) {
		console.log(error.message);
	}
};

const loadRegister = async (req, res) => {
	try {
		res.render('register');
	} catch (err) {
		console.log(err.message);
	}
};

const insertUser = async (req, res) => {
	try {
		const spassword = await securePassword(req.body.password);
		//console.log(req.body);
		const existingUser = await User.findOne({ email: req.body.email });
		if (existingUser) {
			res.render('register', {
				message: 'email already exists',
			});
		}
		if (!req.body.name || req.body.name.trim().length === 0) {
			res.render('register', {
				message: 'please enter valid name',
			});
		}
		const user = new User({
			name: req.body.name,
			email: req.body.email,
			mobile: req.body.mob,
			password: spassword,
			is_admin: 0,
		});
		email = user.email;
		const name = req.body.name;
		const userData = await user.save();
		if (userData) {
			randomnumber = Math.floor(Math.random() * 9000) + 1000;
			otp = randomnumber;
			sendVerifyMail(name, req.body.email, randomnumber);
			res.redirect('/otp');
		} else {
			res.render('register', { message: 'Registration Failed' });
		}
	} catch (error) {
		console.log(error.message);
	}
};

const loginLoad = async (req, res) => {
	try {
		res.render('login', { message });
		message = null;
	} catch (err) {
		console.log(err.message);
	}
};

const userLogout = async (req, res) => {
	try {
		req.session.destroy();
		res.redirect('/home');
	} catch (err) {
		console.log(err.message);
	}
};

const loadShop = async (req, res) => {
	try {
		if (req.session.user_id) {
			const session = req.session.user_id;
			productData = await productmodel.find();
			console.log(productData);
			// categoryData = await categoryModel.find();
			const userData = await User.findById({ _id: req.session.user_id });
			res.render('shop', {
				userData: userData,
				session: session,
				productData: productData,
				//   categoryData,
			});
		} else {
			const session = null;
			//  const categoryData = await categoryModel.find();
			const productData = await productmodel.find();
			res.render('shop', { session, productData: productData });
		}
	} catch (error) {
		console.log(error.message);
	}
};

//======================LOAD SINGLE PRODUCT====
const singleProduct = async (req, res) => {
	try {
		if (req.session.user_id) {
			const session = req.session.user_id;
			const id = req.params.id;
			const data = await productmodel.findOne({ _id: id });
			const userData = await User.findById({ _id: req.session.user_id });
			res.render('singleProduct', { productData: data, userData: userData, session });
		} else {
			const session = null;
			const id = req.params.id;
			const data = await productmodel.findOne({ _id: id });
			res.render('singleProduct', { productData: data, session });
		}
	} catch (error) {
		console.log(error.message);
	}
};

//================= LOAD OTP ===============
const loadVerification = async (req, res) => {
	try {
		res.render('otp');
	} catch (error) {
		console.log(error.message);
	}
};

const verifyEmail = async (req, res) => {
	const otp2 = req.body.otp;
	try {
		if (otp2 == otp) {
			const UserData = await User.findOneAndUpdate({ email: email }, { $set: { is_verified: 1 } });
			if (UserData) {
				res.redirect('/login');
			} else {
				console.log('something went wrong');
			}
		} else {
			res.render('otp', { message: 'Please Check the OTP again!' });
		}
	} catch (error) {
		console.log(error.message);
	}
};

const sendVerifyMail = async (name, email, otp) => {
	console.log('otp' + otp);
	try {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: 'rishanausman786@gmail.com',
				pass: 'kmmrxwdxdnqnfcto',
			},
		});

		const mailOptions = {
			from: 'rishanausman786@gmail.com',
			to: email,
			subject: 'Verification Email',
			html: `<p>Hi ${name}, please click <a href="http://localhost:4000/otp">here</a> to verify and enter your verification email. This is your OTP: ${otp}</p>`,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log('Email has been sent:', info.response);
		// console.log(otp);
	} catch (error) {
		console.log(error);
	}
};
//====load profile===

const loadProfile = async (req, res) => {
	try {
		if (req.session.user_id) {
			const session = req.session.user_id;
			const id = req.session.user_id;
			const userdata = await User.findById({ _id: req.session.user_id });
			res.render('account', { userData: userdata, session });
		} else {
			const session = null;
			res.redirect('/home', { message: 'please login' });
		}
	} catch (error) {
		console.log(error.message);
	}
};

module.exports = {
	loadHome,
	loadRegister,
	insertUser,
	loginLoad,
	verifyLogin,
	userLogout,
	loadShop,
	singleProduct,
	loadVerification,
	verifyEmail,
	sendVerifyMail,
	loadProfile,
};

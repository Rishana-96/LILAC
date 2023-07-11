const User = require('../Model/userModel');
const bcrypt = require('bcrypt');
const productmodel = require('../Model/productModel');
const cartmodel = require('../Model/cartModel')
const categorymodel = require('../Model/categoryModel')
const bannermodel = require('../Model/bannerModel')
const nodemailer = require('nodemailer');
const passwordValidator = require('password-validator');
const session = require('express-session')
const puppeteer = require("puppeteer")
const path = require("path")
const fs = require("fs")
const ejs = require("ejs")




const dotenv = require('dotenv');
const { log } = require('console');
dotenv.config();

let message;

var schema = new passwordValidator();


schema
.is().min(8)                        
.is().max(100)                        
.has().uppercase()                             
.has().lowercase()                             
.has().digits(2)                               
.has().not().spaces()   



const securePassword = async (password) => {
	try {
		const passwordHash = await bcrypt.hash(password, 10);
		return passwordHash;
	} catch (err) {
		console.log(err.message);
	}
};

//===VERIFY LOGIN =====

const verifyLogin = async (req, res) => {
	try {
		const email = req.body.email;
		const password = req.body.password;
	
		const userData = await User.findOne({ email: email });
	
		if (userData) {
		  const passwordMatch = await bcrypt.compare(password, userData.password);
	
		  if (passwordMatch) {
			if (userData.is_admin === 0) {
			  if(userData.is_verified ==true){
			  if (userData.is_block == true) {
				res.render("login", { message: "YOU ARE BLOCKED BY ADMIN" });
			  } else {
				req.session.user_id = userData._id;
	
				res.redirect("/home");
			  }
			}else{
			  res.render("login", { message: "OTP is not verified" });
			}
			} else {
			  res.render("login", { message: "Email or password is incorrect" });
			}
		  } else {
			res.render("login", { message: "Email or password is incorrect" });
		  }
		} else {
		  res.render("login", {
			message: "Please provide your correct Email and password ",
		  });
		}

	} catch (error) {
		console.log(error.message);
	}
}

//=============LOAD HOME======

const loadHome = async (req, res) => {
	try {
		const id = req.session.user_id
		const session = id
		const productdata = await productmodel.find({ Status: true })
		const banners = await bannermodel.find()
	
		if(id){
		  
		  const userData = await User.findById({_id: id})
		  res.render("home",{productData:productdata,userData:userData,session,banners})
		}else{
		  const session = null
		  res.render("home",{productData:productdata,session,banners})
		}
	  } catch (error) {
		console.log(error.message);
	  }
	
	}


//================= LOAD REGISTER ===============

const loadRegister = async (req, res) => {
	try {
		res.render('register');
	} catch (err) {
		console.log(err.message);
	}
};

//================= INSERT USER ===============

const insertUser = async (req, res,next) => {
	try {
		
        const existingUser = await User.findOne({ email: req.body.email });
		if (existingUser) {
			res.render('register', {
				message: 'email already exists',
			});
		}
		const passStrong = await schema.validate(req.body.password)

		if(!passStrong){
			res.render("register",{
				message: " Add minimum 8 charactors, includes uppercase,lowercase, and atleast 20digits"
			})
			return
		}
		const spassword = await securePassword(req.body.password)

		
		const user = new User({
			name: req.body.name,
			email: req.body.email,
			mobile: req.body.mobile,
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
		next(error)
	}
};

//================= LOAD LOGIN ===============

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
		// let cartData = await cartmodel.findOne({ userId: req.session.user_id }).populate('products.productId')
		// const products = cartData.products;
		req.session.destroy();
		const products=0
		const session=null
		res.redirect('/home');
	} catch (err) {
		console.log(err.message);
	}
};

// const loadShop = async (req, res) => {
// 	try {
	
		
		
// 		const productData = await productmodel.find({Status:true})
//          if (req.session.user_id) {
// 			const session = req.session.user_id;
// 			const id = req.session.user_id
// 			const catData = await categorymodel.find()
// 			const userData = await User.findById({ _id: req.session.user_id })
			
			
			
// 			res.render('shop', {
// 				userData: userData,
// 				productData: productData,
// 				category:catData,session
// 			});
				
				
			
// 		} else {
// 			const session = null;
// 			const catData = await categorymodel.find()
// 			const productData = await productmodel.find().limit(2);
// 			res.render('shop', { session,
// 				productData: productData,
// 				category:catData});
			 
// 		}
// 	} catch (error) {
// 		console.log(error.message);
// 	}
// };

const loadShop=async(req,res,next) =>{
	try {
		const session = req.session.user_id
		const productdata = await productmodel.find({ Status: true });
		const catData = await categorymodel.find({ is_delete: false });
        console.log(catData);
		let userdata = null;

		if (req.session.user_id) {
			userdata = await User.findById(req.session.user_id);
		  }



		const page = parseInt(req.query.page) || 1;
		const limit = 4;
		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;
		const productCount = productdata.length;
		const totalPages = Math.ceil(productCount / limit);
		const paginatedProducts = productdata.slice(startIndex, endIndex);


		res.render("shop",{
			session,
			category: catData,
			productData: paginatedProducts,
			currentPage: page,
			totalPages: totalPages,
			userData: userdata,
		})
	} catch (error) {
		next(error)
	}
}



//===================== SEARCH PRODUCT ====================

const searchProduct = async (req,res,next)=>{
	try{
	   const searchData = req.body.search;
	   const search = searchData.trim()
	   const session = req.session.user_id;
	   const userData = await User.find({})
	   const categoryData = await categorymodel.find({is_deleted:false});
		const productData = await productmodel.find({productName:{$regex: `^${search}`,$options:'i'}});     
		const page = parseInt(req.query.page) || 1;
	  const limit = 4;
	  const startIndex = (page - 1) * limit;
	  const endIndex = page * limit;
	  const productCount = productData.length;
	  const totalPages = Math.ceil(productCount / limit);
	  const paginatedProducts = productData.slice(startIndex, endIndex);
	   
	   if(productData.length > 0){
		res.render('shop',{session,
		  category:categoryData,
		  productData:paginatedProducts,
		  userData:userData,
		  currentPage: page,
		  totalPages: totalPages,});
	   }else{
		res.render('shop',{session,
		  category:categoryData,
		  productData:paginatedProducts,
		  userData:userData,
		  currentPage: page,
		  totalPages: totalPages,});
	   }
  
	}catch(error){
	  next(error);
	}
  }


//======================LOAD SINGLE PRODUCT====
const singleProduct = async (req, res,next) => {
	try {
		if (req.session.user_id) {
			const session = req.session.user_id;
			const id = req.params.id;
			const data = await productmodel.findOne({ _id: id });
			const userData = await User.findById({ _id: req.session.user_id });
			let cartData = await cartmodel.findOne({ userId: req.session.user_id }).populate('products.productId')
			// const products = cartData.products;
			res.render('singleProduct', { productData: data, userData: userData, session,
				// products
			 });
		} else {
			const session = null;
			// const products = 0
			const id = req.params.id;
			const data = await productmodel.findOne({ _id: id });
			res.render('singleProduct', { productData: data, session
				// ,products
			});
		}
	} catch (error) {
		next(error)
	}
};

//================= LOAD OTP ===============
const loadVerification = async (req, res,next) => {
	try {
		res.render('otp');
	} catch (error) {
		next(error)
	}
};

//====verify otp==========

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
				user: process.env.verificationEmail ,
				pass: process.env.mailkey,
			},
		});

		const mailOptions = {
			from: process.env.verificationEmail,
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

const loadProfile = async (req, res,next) => {
	try {
		if (req.session.user_id) {
			const session = req.session.user_id;
			const id = req.session.user_id;
			const userdata = await User.findById({ _id: req.session.user_id });
			// let cartData = await cartmodel.findOne({ userId: req.session.user_id }).populate('products.productId')
			// const products = cartData.products;
			res.render('account', { userData: userdata, session 
				// ,products
			});
		} else {
			const session = null;
			
			res.redirect('/home', {message: 'please login' });
		}
	} catch (error) {
		next(error)
	}
};

//====================== FILTER BY CATEGORY ==================

const filterByCategory =async (req,res,next)=>{
	try {
	  const id = req.params.id
	  const session = req.session.user_id
	  const catData = await categorymodel.find({is_delete:false })
	  const userData = await User.find({})
	  const productData = await productmodel.find({category:id,Status:true}).populate('category')
      
	  const page = parseInt(req.query.page) || 1;
	  const limit = 4;
	  const startIndex = (page - 1) * limit;
	  const endIndex = page * limit;
	  const productCount = productData.length;
	  const totalPages = Math.ceil(productCount / limit);
	  const paginatedProducts = productData.slice(startIndex, endIndex);




	  if (catData.length > 0) {
		res.render("shop",{
			session,
			userData:userData,
			productData:paginatedProducts,
			currentPage: page,
			totalPages: totalPages,
			category:catData
		})
	  } else {
		res.render("shop",{
			session,
			userData:userData,
			productData:[],
			category:catData,
			currentPage: page,
			totalPages: totalPages

		})
  
	  }
	} catch (error) {
	  next(error)
	}
  }

  const priceSort = async(req,res,next) => {
	try {
	  const id = req.params.id
	  const session = req.session.user_id;
	   const userData = await User.find({})
	   const categoryData = await categorymodel.find({is_deleted:false});
	   const productData = await productmodel.find({ Status: true }).populate('category').sort({price: id})
  
	   const page = parseInt(req.query.page) || 1;
	  const limit = 4;
	  const startIndex = (page - 1) * limit;
	  const endIndex = page * limit;
	  const productCount = productData.length;
	  const totalPages = Math.ceil(productCount / limit);
	  const paginatedProducts = productData.slice(startIndex, endIndex);
	  if (productData){
		res.render('shop',{session,category:categoryData,productData:paginatedProducts,userData:userData,currentPage: page,
		  totalPages: totalPages,});
	  }else {
		res.render('shop',{session,category:categoryData,productData:paginatedProducts,userData:userData,currentPage: page,
		  totalPages: totalPages,});
	  }
  
	} catch (error) {
	  next(error)
	}
  }

  

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
	filterByCategory,
	searchProduct,
	priceSort ,
	
};

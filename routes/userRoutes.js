const express = require('express')
const user_route =express()
const cartController = require('../controllers/cartController')
const addressController = require('../controllers/addressController')
const orderController =  require ('../controllers/orderController')

const session=require('express-session')

const config=require('../config/config')
user_route.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:false}))
const auth=require('../middleware/auth')

user_route.set('view engine','ejs')
user_route.set('views','./views/user')

const bodyParser=require('body-parser')
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({ extended: true }))

user_route.use(express.urlencoded({extended:true}))
user_route.use(express.json())

const userController = require('../controllers/userController')

user_route.get('/home',userController.loadHome)

user_route.get('/register',userController.loadRegister)
user_route.post('/register',userController.insertUser)
user_route.get('/login',auth.isLogout,userController.loginLoad)
user_route.post('/login',userController.verifyLogin)
user_route.get('/',userController.loadHome)
user_route.get("/otp", userController.loadVerification);
user_route.post("/otp", userController.verifyEmail);
user_route.get("/profile",auth.isLogin,userController.loadProfile)
user_route.get("/address",addressController.loadAddresses)
user_route.get("/addAddress",auth.isLogin,addressController.loadAddAddress)
user_route.post("/addAddress",auth.isLogin,addressController.addAddress)
user_route.get("/editAddress/:id",auth.isLogin,addressController.loadEditAddress)
user_route.post("/editAddress/:id",auth.isLogin,addressController.editAddress)
user_route.post('/deleteAddress',auth.isLogin,addressController.deleteAddress)
user_route.get('/address',auth.isLogin,addressController.showAddress)


user_route.get('/logout',auth.isLogin,userController.userLogout)
user_route.get('/shop',userController.loadShop)
user_route.get("/singleProduct/:id", userController.singleProduct)
user_route.get("/cart",auth.isLogin,cartController.loadCart)
user_route.post('/addtocart',auth.isLogin,cartController.addToCart);
user_route.post('/changeQuantity',auth.isLogin,cartController.changeProductCount);
user_route.post('/deletecart',auth.isLogin,cartController.deletecart);


user_route.get('/checkout',auth.isLogin,orderController.loadChekout)
user_route.get("/orders",auth.isLogin,orderController.loadOrder)

module.exports = user_route
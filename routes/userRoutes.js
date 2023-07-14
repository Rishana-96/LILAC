const express = require('express')
const user_route =express()
const auth=require('../middleware/auth')
const errorHandler = require('../middleware/errorHandler')
const session=require('express-session')
const config=require('../config/config')




const userController =require('../controllers/userController')
const cartController = require('../controllers/cartController')
const addressController = require('../controllers/addressController')
const orderController =  require ('../controllers/orderController')
const wishlistController = require('../controllers/wishlistController')
const offerController = require('../controllers/offerController')







user_route.set('view engine','ejs')
user_route.set('views','./views/user')


user_route.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:false}))
user_route.use(express.urlencoded({extended:true}))
user_route.use(express.json())

user_route.get('/home',userController.loadHome)
user_route.get('/register',userController.loadRegister)
user_route.post('/register',userController.insertUser)
user_route.get('/login',auth.isLogout,userController.loginLoad)
user_route.post('/login',userController.verifyLogin)
user_route.get('/',userController.loadHome)
user_route.get("/otp", userController.loadVerification);
user_route.post("/otp", userController.verifyEmail);
user_route.get("/forgotPassword", userController.forgotPassword);
user_route.post("/forgotPassword", userController.forgotVerifyMail);
user_route.post('/verifyForgot',userController.verifyForgotMail)
user_route.post('/resubmitPassword',userController.resubmitPassword)
user_route.get("/profile",auth.isLogin,userController.loadProfile)
user_route.get('/logout',auth.isLogin,userController.userLogout)
user_route.get('/shop',userController.loadShop)
user_route.get("/priceSort/:id", userController.priceSort)
user_route.get("/filterCategory/:id",userController.filterByCategory)
user_route.post("/form", userController.searchProduct)
user_route.get("/singleProduct/:id", userController.singleProduct)

user_route.get("/addAddress",auth.isLogin,addressController.loadAddAddress)
user_route.post("/addAddress",auth.isLogin,addressController.addAddress)
user_route.get("/editAddress/:id",auth.isLogin,addressController.loadEditAddress)
user_route.post("/editAddress/:id",auth.isLogin,addressController.editAddress)
user_route.post('/deleteAddress',auth.isLogin,addressController.deleteAddress)
user_route.get('/address',auth.isLogin,addressController.showAddress)





user_route.get("/cart",auth.isLogin,cartController.loadCart)
user_route.post('/addtocart',auth.isLogin,cartController.addToCart);
user_route.post('/changeQuantity',auth.isLogin,cartController.changeProductCount);
user_route.post('/deletecart',auth.isLogin,cartController.deletecart);


user_route.get('/checkout',auth.isLogin,orderController.loadChekout)
user_route.get("/orders",auth.isLogin,orderController.loadOrderUser)
user_route.post('/placeOrder',auth.isLogin,orderController.placeOrder)
user_route.get("/vieworder/:id",auth.isLogin, orderController.loadViewSingleUser)
user_route.post('/cancelOrder',auth.isLogin,orderController.CancelOrder);
user_route.post('/returnOrder',orderController.returnOrder);
user_route.post('/verifyPayment',auth.isLogin,orderController.verifyPayment)
user_route.get("/invoiceDownload/:id",orderController.loadInvoice)



user_route.get('/wishlist',auth.isLogin,wishlistController.loadWishlist)
user_route.post('/addtoWishlist',auth.isLogin,wishlistController.addToWishlist);
user_route.post('/addtocartfromwish',auth.isLogin,wishlistController.addToCartFromWish);
user_route.post('/deletewishlist',auth.isLogin,wishlistController.deleteWishlist);

user_route.post('/applyCoupon',offerController.applyCoupon)





 user_route.use(errorHandler)

module.exports = user_route
const express = require('express');
const admin_route = express();
const upload = require('../config/multer.js');







//===SET VIEW ENGINE=====
admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');

//==REQUIRE ALL CONTROLLERS===
const errorHandler = require('../middleware/errorHandler.js')
const auth = require("../middleware/adminAuth.js")
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController.js');
const orderController = require('../controllers/orderController.js')
const offerController = require('../controllers/offerController.js')
const bannerController = require('../controllers/bannerController.js')

//===USER MANAGEMENT========
admin_route.get('/', auth.isLogout, adminController.loadLogin);
admin_route.post('/', adminController.verifyLogin);
admin_route.get('/dashboard', auth.isLogin, adminController.loadDashboard);
admin_route.get('/userList', auth.isLogin, adminController.newUserLoad);
admin_route.get('/blockUser', auth.isLogin, adminController.block);
admin_route.get('/unblockUser', auth.isLogin, adminController.unblock);
admin_route.get('/logout',auth.isLogin,adminController.adminLogout)
admin_route.get('/salesReport',auth.isLogin,adminController.loadSalesReport); 
admin_route.get('/salesSort/:id',auth.isLogin,adminController.salesSort); 

//===Category Mnagement======
admin_route.get('/categoryList', auth.isLogin, categoryController.categoryList);
admin_route.post('/insertCategory', auth.isLogin, categoryController.insertCategory);
admin_route.get('/unlistcategory', auth.isLogin, categoryController.unlistCategory);
admin_route.get('/listcategory', auth.isLogin, categoryController.listCategory);
admin_route.post('/editCategory/:id', auth.isLogin, categoryController.saveCategory);



//===product Management==============
admin_route.get('/productList', auth.isLogin, productController.productList);
admin_route.post('/addProduct', upload.upload.array('image', 10), productController.insertProduct);
admin_route.get('/deleteProduct', auth.isLogin, productController.deleteProduct);
admin_route.get('/editProduct/:id', auth.isLogin, productController.editProduct);
admin_route.post("/editproduct/updateimage/:id",upload.upload.array('image'),productController.updateimage)
admin_route.get('/deleteimg/:imgid/:prodid', auth.isLogin, productController.deleteimage);
admin_route.post('/editProduct/:id', upload.upload.array('image', 10), productController.editUpdateProduct);

//====ORDER MANAGEMENT======
admin_route.get("/orders",auth.isLogin,orderController.loadOrderAdmin)
admin_route.get("/vieworder/:id",auth.isLogin,orderController.loadViewsingleAdmin)
admin_route.post("/updateStatus",auth.isLogin,orderController.changeStatus)
admin_route.post("/addOffer",auth.isLogin,offerController.addOffer)


//====COUPON==========
admin_route.get("/coupons",auth.isLogin,offerController.loadCoupon)
admin_route.post("/addCoupon",auth.isLogin,offerController.insertCoupon) 
admin_route.post("/editCoupon/:id",auth.isLogin,offerController.editCoupon) 
admin_route.post("/deleteCoupon",auth.isLogin,offerController.deleteCoupon) 


//===BANNER MANGEMENT========
admin_route.get("/banner",auth.isLogin,bannerController.loadBannerManagement)
admin_route.post("/addbanner",upload.upload.single('image'),auth.isLogin,bannerController.addBanner)
admin_route.post('/editBanner', upload.upload.single('image'),bannerController.editBanner);
admin_route.post("/deleteBanner",bannerController.deleteBanner) 


admin_route.use(errorHandler)

admin_route.get("*",function(req,res) {
    res.redirect("/admin")
})




module.exports = admin_route;

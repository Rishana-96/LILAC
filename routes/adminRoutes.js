const express = require('express');
const admin_route = express();
const nocache = require('nocache');
const multer = require('multer');
const upload = require('../config/multer.js');
const session = require('express-session');
const config = require('../config/config');
const auth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController.js');

admin_route.use(nocache());
admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: true }));
admin_route.use(
	session({
		secret: config.sessionSecret,
		saveUninitialized: true,
		resave: false,
		cookie: {
			maxAge: 604800000,
		},
	})
);

admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');

admin_route.get('/', auth.isLogout, adminController.loadLogin);
admin_route.post('/', adminController.verifyLogin);
admin_route.get('/dashboard', auth.isLogin, adminController.loadDashboard);
admin_route.get('/userList', auth.isLogin, adminController.newUserLoad);
admin_route.get('/blockUser', auth.isLogin, adminController.block);
admin_route.get('/unblockUser', auth.isLogin, adminController.unblock);

admin_route.get('/categoryList', auth.isLogin, categoryController.categoryList);
admin_route.post('/insertCategory', auth.isLogin, categoryController.insertCategory);
admin_route.get('/unlistcategory', auth.isLogin, categoryController.unlistCategory);
admin_route.get('/listcategory', auth.isLogin, categoryController.listCategory);
admin_route.get('/editCategory', auth.isLogin, categoryController.editCategory);
admin_route.post('/editCategory', auth.isLogin, categoryController.saveCategory);

admin_route.get('/productList', auth.isLogin, productController.productList);
admin_route.get('/addProduct', auth.isLogin, productController.AddProducts);
admin_route.post('/addProduct', upload.upload.array('image', 10), productController.insertProduct);
admin_route.get('/deleteProduct', auth.isLogin, productController.deleteProduct);
admin_route.get('/editProduct/:id', auth.isLogin, productController.editProduct);
admin_route.post('/editProduct', auth.isLogin, productController.updateimage);
// admin_route.post('/editProduct/:id',upload.upload.array('image',10),productController.updateProduct)
admin_route.get('/deleteimg/:imgid/:prodid', auth.isLogin, productController.deleteimage);
admin_route.post('/editProduct/:id', upload.upload.array('image', 10), productController.editUpdateProduct);

module.exports = admin_route;

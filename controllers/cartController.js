const cartmodel = require('../Model/cartModel');
const session = require('express-session');
const User = require('../Model/userModel');
const productmodel = require('../Model/productModel');

//================== LOAD CART PAGE ===============

const loadCart = async (req, res) => {
	try {
		let id = req.session.user_id;
		const session = req.session.user_id;

		let userName = await User.findById({ _id: id });
		let cartData = await cartmodel.findOne({ userId: id }).populate('products.productId');
		if (id) {
			if (cartData) {
				if (cartData.products.length > 0) {
					const products = cartData.products;
				    const total = await cartmodel.aggregate([
						{ $match: { userId: id } },
						{ $unwind: "$products" },
			  
						{
						  $group: {
							_id: null,
							total: {
							  $sum: {
								$multiply: ["$products.productPrice", "$products.count"],
							  },
							},
						  },
						},
					  ]);

					const Total = total.length > 0 ? total[0].total : 0;
					const totalAmount = Total + 80;
					const userId = userName._id;
					

					res.render('cart', {
						products: products,
						Total: Total,
						userId,
						session,
						totalAmount,
						userData: userName,
					});
				} else {
					res.render('cartEmpty', {
						userData: userName,
						session,
						message: 'No Products Added to Cart',
					});
				}
			} else {
				res.render('cartEmpty', {
					userData: userName,
					session,
					message: 'No Products Added to Cart',
				});
			}
		} else {
			res.redirect('/login');
		}
	} catch (error) {
		console.log(error.message);
	}
};



const addToCart = async (req, res) => {
	try {
		const userId = req.session.user_id;
		const userData = await User.findOne({ _id: userId });

		const productId = req.body.id;
		const productData = await productmodel.findOne({ _id: productId });

		const productQuantity = productData.StockQuantity;

		const cartData = await cartmodel.findOneAndUpdate(
			{ userId: userId },
			{
				$setOnInsert: {
					userId: userId,
					userName: userData.name,
					products: [],
				},
			},
			{ upsert: true, new: true }
		);
		

		const updatedProduct = cartData.products.find((product) => product.productId === productId);
		const updatedQuantity = updatedProduct ? updatedProduct.count : 0;

		if (updatedQuantity + 1 > productQuantity) {
			return res.json({
				success: false,
				message: 'Quantity limit reached!',
			});
		}

		const cartProduct = cartData.products.find((product) => product.productId === productId);

		if (cartProduct) {
			await cartmodel.updateOne(
				{ userId: userId, 'products.productId': productId },
				{
					$inc: {
						'products.$.count': 1,
						'products.$.totalPrice': productData.price,
					},
				}
			);
		} else {
			cartData.products.push({
				productId: productId,
				productPrice: productData.price,
				totalPrice: productData.price,
			});
			await cartData.save();
		}

		res.json({ success: true });
	} catch (error) {
		console.log(error.message);
		res.status(500).json({ success: false, message: 'Server Error' });
	}
};

const changeProductCount = async (req, res) => {
	try {
		const userData = req.session.user_id;
		const proId = req.body.product;
		let count = req.body.count;
		count = parseInt(count);
		const cartData = await cartmodel.findOne({ userId: userData });
		const product = cartData.products.find((product) => product.productId === proId);
		const productData = await productmodel.findOne({ _id: proId });

		const productQuantity = productData.StockQuantity;
		const updatedCartData = await cartmodel.findOne({ userId: userData });
		const updatedProduct = updatedCartData.products.find((product) => product.productId === proId);
		const updatedQuantity = updatedProduct.count;

		if (count > 0) {
			if (updatedQuantity + count > productQuantity) {
				res.json({ success: false, message: 'Quantity limit reached!' });
				return;
			}
		} else if (count < 0) {
			if (updatedQuantity <= 1 || Math.abs(count) > updatedQuantity) {
				res.json({ success: true });
				return;
			}
		}

		const cartdata = await cartmodel.updateOne(
			{ userId: userData, 'products.productId': proId },
			{ $inc: { 'products.$.count': count } }
		);
		const updateCartData = await cartmodel.findOne({ userId: userData });
		const updateProduct = updateCartData.products.find((product) => product.productId === proId);
		const updateQuantity = updateProduct.count;

		const price = updateQuantity * productData.price;

		await cartmodel.updateOne(
			{ userId: userData, 'products.productId': proId },
			{ $set: { 'products.$.totalPrice': price } }
		);

		res.json({ success: true });
	} catch (error) {
		console.log(error.message);
		res.status(500).json({ success: false, error: error.message });
	}
};

//======================= DELETE PRODUCT FROM CART ==================
const deletecart = async (req, res) => {
	try {
		const id = req.session.user_id;
		const proid = req.body.product;
		const cartData = await cartmodel.findOne({ userId: id });

		if (cartData.products.length === 1) {
			await cartmodel.deleteOne({ userId: id });
			// res.render('cart')
		} else {
			const found = await cartmodel.updateOne({ userId: id }, { $pull: { products: { productId: proid } } });
		}

		res.json({ success: true });
	} catch (error) {
		console.log(error.message);
	}
};

module.exports = {
	loadCart,
	addToCart,
	changeProductCount,
	deletecart,
};

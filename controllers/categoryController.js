//const category=require('../models/categoryModel')
const category = require('../Model/categoryModel');
const usermodal = require('../Model/userModel');
const uc = require('upper-case');
const session = require('express-session');
let mes;

// list category
const categoryList = async (req, res) => {
	try {
		const catData = await category.find({ is_delete: false });
		const adminData = await usermodal.findById({ _id: req.session.Auser_id });

		res.render('categoryList', { category: catData, mes, admin: adminData });
	} catch (error) {
		console.log(error.message);
	}
};

//add category

const insertCategory = async (req, res) => {
	try {
		if (req.session.Auser_id) {
			const catName = uc.upperCase(req.body.categoryName);
			const Category = new category({ categoryName: catName });
			if (catName.trim().length === 0) {
				res.redirect('/admin/categoryList');
				mes = 'invalid typing';
			} else {
				const categoryDatas = await category.findOne({ categoryName: catName });
				if (categoryDatas) {
					// mes ='This category is already exist'
					const catData = await category.find({ is_delete: false });
					await category.updateOne({ categoryName: catName }, { $set: { is_delete: false } });
					const adminData = await usermodal.findById({ _id: req.session.Auser_id });
					res.render('categoryList', {
						mes: 'This category is already exist',
						admin: adminData,
						category: catData,
					});
				} else {
					const categoryData = await Category.save();
					if (categoryData) {
						res.redirect('/admin/categoryList');
					} else {
						res.redirect('/admin/dashboard');
					}
				}
			}
		} else {
			res.redirect('/admin');
		}
	} catch (error) {
		console.log(error.message);
	}
};

const unlistCategory = async (req, res) => {
	try {
		const categoryData = await category.findByIdAndUpdate(req.query.id, { $set: { is_delete: true } });
		// console.log(categoryData);
		res.redirect('/admin/categoryList');
	} catch (error) {
		console.log(error.message);
	}
};
const listCategory = async (req, res) => {
	try {
		const categoryData = await category.findByIdAndUpdate(req.query.id, { $set: { is_delete: false } });
		res.redirect('/admin/categoryList');
	} catch (error) {
		console.log(error.message);
	}
};

//save category

const saveCategory = async (req, res) => {
	try {
		const name = req.body.categoryName;
		const catData = await category.findOneAndUpdate({ _id: req.query.id }, { $set: { categoryName: name } });
		if (catData) {
			res.redirect('categoryList');
		}
	} catch (error) {
		console.log(error.message);
	}
};
//edit category

const editCategory = async (req, res) => {
	try {
		const id = req.query.id;
		const catDATA = await category.findById({ _id: id });
		const adminData = await usermodal.findById({ _id: req.session.Auser_id });

		res.render('editCategory', { Category: catDATA, admin: adminData });
	} catch (error) {
		console.log(error.message);
	}
};

module.exports = {
	insertCategory,
	unlistCategory,
	listCategory,
	categoryList,
	saveCategory,
	editCategory,
};

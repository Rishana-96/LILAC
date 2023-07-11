
const category = require('../Model/categoryModel');
const User= require('../Model/userModel');
const product = require('../Model/productModel')
const uc = require('upper-case');
const session = require('express-session');
let mes;

// list category
const categoryList = async (req, res,next) => {
	try {
		const catData = await category.find({is_delete:false});
		const adminData = await User.findById({ _id: req.session.Auser_id });

		res.render('categoryList', { category: catData, mes, admin: adminData });
	} catch (error) {
		next(error)
	}
};

//=====add category==========

const insertCategory = async (req,res,next) =>{
    try {
        if(req.session.Auser_id){
            const catName = uc.upperCase(req.body.categoryName);
            const Category = new category({categoryName : catName});
            if(catName.trim().length === 0){
                res.redirect('/admin/categoryList');
                // mes = "invalid typing"
            }else{
                const categoryDatas = await category.findOne({categoryName:catName});
                if(categoryDatas){
                    mes ='This category is already exist'
                    res.redirect('/admin/categoryList');
                }else{
                    const categoryData = await Category.save()
                    if(categoryData){ 
                        res.redirect('/admin/categoryList')
                    }else{
                        res.redirect('/admin/dashBoard');
                    }
                }
            }
        }else{
            res.redirect('/admin')
        }
    } catch (error) {
        next(error)
    }
}


const unlistCategory = async (req, res,next) => {
	try {
		const categoryData = await category.findByIdAndUpdate(req.query.id, { $set: { is_delete: true } });
		// console.log(categoryData);
		res.redirect('/admin/categoryList');
	} catch (error) {
		next(error)
	}
};
const listCategory = async (req, res,next) => {
	try {
		const categoryData = await category.findByIdAndUpdate(req.query.id, { $set: { is_delete:false} });
		res.redirect('/admin/categoryList');
	} catch (error) {
		next(error)
	}
};

//save category

const saveCategory = async (req, res,next) => {
	try {
		const id =req.params.id
		const name = req.body.categoryName;
		const catData = await category.findOneAndUpdate({ _id: req.query.id }, { $set: { categoryName: name } });
		if (catData) {
			res.redirect('categoryList');
		}
	} catch (error) {
		next(error)
	}
};
//edit category

const editCategory = async (req, res,next) => {
	try {
		const id = req.query.id;
		const catDATA = await category.findById({ _id: id });
		const adminData = await User.findById({ _id: req.session.Auser_id });

		res.render('editCategory', { Category: catDATA, admin: adminData });
	} catch (error) {
		next(error)
	}
};

module.exports = {
	insertCategory,
	unlistCategory,
	listCategory,
	categoryList,
	saveCategory,
	//editCategory,
};

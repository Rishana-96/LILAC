// const User=require('../Model/userModel')
const bcrypt=require('bcrypt')
const User=require('../Model/userModel')
const session=require('express-session')
const productmodel = require("../Model/productModel")
const cartmodel = require("../Model/cartModel")
const ordermodel = require("../Model/orderModel")


const ejs =require('ejs')
const fs =require('fs')
const path =require('path')

let message


//=====LOAD LOGIN PAGE===

const loadLogin= async(req,res,next)=>{
    try{
        
        res.render('login')
        
    }catch(error){
        next(error)
    }
}

//=========VERIFY LOGIN=====
const verifyLogin = async (req, res,next) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
  //THIS IS AN EDITED AREA
      const userData = await User.findOne({ email: email });
      if (userData) {
        const passwordMatch = await bcrypt.compare(password, userData.password);
  
        if (passwordMatch) {
          if (userData.is_admin === 0) {
            res.render("login", {
              message: "Not an Admin",
            });
          } else {
            req.session.Auser_id = userData._id;
            res.redirect("/admin/dashBoard");
          }
        } else {
          res.render("login", { message: "Email or password is incorrect" });
        }
      } else {
        res.render("login", {
           message: "Please provide your email and password",
           });
      }
    } catch (error) {
      next(error)
    }
  };

//LOAD DASHBOARD=======
const loadDashboard = async (req, res) => {
    try {
      const adminData = await User.findById({ _id: req.session.Auser_id });
      const userData = await User.findById({ _id: req.session.Auser_id });
      
      const aggregationPipeline = [
        // Total Sales Amount
        {
          $facet: {
            totalSales: [
              { $unwind: "$products" },
              { $match: { "products.status": "Delivered" } },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$products.totalPrice" },
                },
              },
              {
                $project: {
                  _id: 0,
                  total: 1,
                },
              },
            ],
            CODTotal: [
              // Total COD
              { $unwind: "$products" },
              { $match: { "products.status": "Delivered", paymentMethod: "COD" } },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$products.totalPrice" },
                },
              },
              {
                $project: {
                  _id: 0,
                  total: 1,
                },
              },
            ],
            onlinePaymentTotal: [
              // Total Online Payment
              { $unwind: "$products" },
              { $match: { "products.status": "Delivered", paymentMethod: { $ne: "COD" } } },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$products.totalPrice" },
                },
              },
              {
                $project: {
                  _id: 0,
                  total: 1,
                },
              },
            ],
          },
        },
      ];
  
      const [results] = await ordermodel.aggregate(aggregationPipeline);
  
      const total = results.totalSales[0]?.total || 0;
      const codTotal = results.CODTotal[0]?.total || 0;
      const onlineTotal = results.onlinePaymentTotal[0]?.total || 0;
  
      const totalOrders = await ordermodel.find();
      const totalProducts = await productmodel.find();
  




      res.render('dashboard', {
        users: userData,
         admin: adminData,
         total,
         totalOrders,
         totalProducts,
         codTotal,
         onlineTotal,
         });
    } catch (error) {
      console.log(error.message);
    }
  };
 
//=======LOAD ALL USERS===
  const newUserLoad= async(req,res,next)=>{
    try {
    const userData = await User.find({is_admin:0});
    const adminData = await User.findById({ _id: req.session.Auser_id });

    res.render("userList"
    ,{users: userData,admin:adminData}
    );
  } catch (error) {
    next(error)
  }
  }


  //==========BLOCK AND UNBLOCK USER=====
  const block = async (req,res,next)=>{
    try{
        const userData = await User.findByIdAndUpdate(req.query.id,{$set:{is_block:true}})
        req.session.users=null
        res.redirect('/admin/userList')
    }catch(error){
        next(error)
    }
  }


  const unblock = async (req,res,next)=>{
    try{
        const userData = await User.findByIdAndUpdate(req.query.id,{$set:{is_block:false}})
        req.session.users=null
        res.redirect('/admin/userList')
    }catch(error){
        next(error)
    }
  }


  //===================== LOGOUT ADMIN ==================

const adminLogout = async (req,res,next)=>{
  try{
      req.session.destroy();
      res.redirect('/admin')
  }catch(error){
    next(error)
  }
}

const loadSalesReport = async(req,res,next) =>{
  try {
    const adminData = await User.findById({ _id: req.session.Auser_id });
    const adminId = req.session.Auser_id
    const order = await ordermodel.aggregate([
      { $unwind: "$products" },
      { $match: { 'products.status': 'Delivered' } },
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: 'products',
          let: { productId: { $toObjectId: '$products.productId' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$productId'] } } }
          ],
          as: 'products.productDetails'
        }
      },  
      {
        $addFields: {
          'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] }
        }
      }
    ]);

    res.render('salesreport',{
      admin:adminData,
      order
    })

  } catch (error) {
    next(error)
  }
}

//==== SALES REPORT=====
const salesSort = async(req,res,next) =>{
  try {
    const adminData = await User.findById({ _id: req.session.Auser_id });
    const id = parseInt(req.params.id);
    const from = new Date();
    const to = new Date(from.getTime() - id * 24 * 60 * 60 * 1000);
    
    const order = await ordermodel.aggregate([
      { $unwind: "$products" },
      {$match: {
        'products.status': 'Delivered',
        $and: [
          { 'products.deliveryDate': { $gt: to } },
          { 'products.deliveryDate': { $lt: from } }
        ]
      }},
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: 'products',
          let: { productId: { $toObjectId: '$products.productId' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$productId'] } } }
          ],
          as: 'products.productDetails'
        }
      },  
      {
        $addFields: {
          'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] }
        }
      }
    ]);

    res.render("salesreport", { order,admin:adminData });
   
  } catch (error) {
    next(error)
  }
}


    
    module.exports = {
        loadLogin,
        verifyLogin,
        loadDashboard,
        newUserLoad,
        block,
        unblock,
        adminLogout,
        loadSalesReport,
        salesSort
    }
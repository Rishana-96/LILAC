// const User=require('../Model/userModel')
const bcrypt=require('bcrypt')
const usermodel=require('../Model/userModel')
const session=require('express-session')

let message

const loadLogin= async(req,res)=>{
    try{
        
        res.render('login',{message})
        message=null
    }catch(err){
        console.log(err.message);
    }
}

// const verifyLogin= async(req,res)=>{
//     try{
//         const email=req.body.email
//         const password=req.body.password

//         const userData=await User.findOne({email:email})

//         if(userData){
//             const passwordMatch=await bcrypt.compare(password,userData.password)
//             console.log(passwordMatch);
//             if(passwordMatch){
                
//                 if(userData.is_admin===0){
//                     res.render('login',{message:'Email and password incorrect'})
//                 }else{
//                     req.session.Auser_id=userData._id
//                     res.redirect('/admin/dashboard')
//                 }
//             }else{
//                 res.render('login',{message:'Email or password is incorrect'})
//                 console.log('incorrect');
//             }
//         }else{
//             res.render('login',{message:'Email and password incorrect'})
//         }


//     }catch(err){
//         console.log(err.message);
//     }
// }

const verifyLogin = async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
  //THIS IS AN EDITED AREA
      const userData = await usermodel.findOne({ email: email });
    //   console.log(userData);
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
      console.log(error.message);
    }
  };


const loadDashboard = async (req, res) => {
    try {
      const userData = await usermodel.findById({ _id: req.session.Auser_id });
      res.render('dashboard', { admin: userData });
    } catch (error) {
      console.log(error.message);
    }
  };
  const adminDashboard = async (req, res) => {
    try {
        const adminData = await usermodel.findById({ _id: req.session.Auser_id });
    res.render("dashboard", { admin: adminData });
  } catch (error) {
    console.log(error.message);
  }
  };

  const newUserLoad= async(req,res)=>{
    try {
    const userData = await usermodel.find({is_admin:0});
    const adminData = await usermodel.findById({ _id: req.session.Auser_id });

    res.render("userList"
    ,{users: userData,admin:adminData}
    );
  } catch (error) {
    console.log(error.message);
  }
  }

  const block = async (req,res)=>{
    try{
        const userData = await usermodel.findByIdAndUpdate(req.query.id,{$set:{is_block:true}})
        req.session.users=null
        res.redirect('/admin/userList')
    }catch(error){
        console.log(error.me
            );
    }
  }


  const unblock = async (req,res)=>{
    try{
        const userData = await usermodel.findByIdAndUpdate(req.query.id,{$set:{is_block:false}})
        req.session.users=null
        res.redirect('/admin/userList')
    }catch(error){
        console.log(error.me);
    }
  }

    
    module.exports = {
        loadLogin,
        verifyLogin,
        loadDashboard,
        adminDashboard,
        newUserLoad,
        block,
        unblock
    }
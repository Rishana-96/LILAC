const session = require("express-session");
const productmodel = require("../Model/productModel");
const categorymodel = require("../Model/categoryModel");
const User = require("../Model/userModel");
const fs =require("fs")
const path = require("path")


//=======LOAD PRODUCT LIST PAGE====
const productList = async (req, res) => {
  try {
    const productData = await productmodel.find({Status:true}).populate('category')
    const categoryData = await categorymodel.find({is_delete:false})
    const adminData = await User.findById({ _id: req.session.Auser_id });
    res.render("productList", { products: productData, admin: adminData,category: categoryData });
  } catch (error) {
    console.log(error.message);
  }
};





//=======INSERT PRODUCT==========
const insertProduct = async (req, res) => {
  try {
    const image = [];
    if (req.files && req.files.length > 0) {
      for (i = 0; i < req.files.length; i++) {
        image[i] = req.files[i].filename;
      }
    }
    const category = await categorymodel.findById(req.body.category);
    const new_product = new productmodel({
      productName: req.body.productName,
      price: req.body.price,
      image: image,
      category:category.categoryName,
      StockQuantity: req.body.StockQuantity,
      description: req.body.description,
    });
    const productData = await new_product.save();
    if (productData) {
      return res.redirect("/admin/productList");
    } else {
      return res.redirect("/admin/productList");
    }
  } catch (error) {
    console.log(error.message);
  }
};


//===DELETE PRODUCT====
const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const product =   await productmodel.updateOne({ _id: id }, { $set: { Status: false } });
    //const dlt = await productmodel.deleteOne({ _id: id });
    res.redirect('/admin/productList');
  } catch (error) {
    console.log(error.message);
  }
};


//====================SHOW EDIT PRODUCT===
const editProduct = async(req,res) => {
  try {
     const id = req.params.id
     const productData = await productmodel.findOne({_id:id}).populate('category')
     const catData= await categorymodel.find({is_delete: false})
     const adminData = await User.findById({_id:req.session.Auser_id})
     res.render("editProduct",{admin:adminData,category:catData,products:productData})
  } catch (error) {
      console.log(error.message);
  }
}



//==================EDITUPDATE PRODUCT=========
const editUpdateProduct = async (req,res) =>{
  if(req.body.productName.trim()=== "" || req.body.category.trim() === "" || req.body.description.trim() === "" || req.body.StockQuantity.trim() === "" || req.body.price.trim() === "" ) {
      const id = req.params.id
      const productData = await productmodel.findOne({_id:id}).populate('category')
      const categoryData =categorymodel.find({})
      const adminData = await User.findById({_id:req.session.Auser_id})
      res.render('editProduct',{admin:adminData,products: productData, message:"All fields required",categorydata:categoryData})
  }else{
      try {
          const arrayimg = []
          for(file of req.files){
              arrayimg.push(file.filename)
          }
          const price = req.body.price
          const ooffp = req.body.offPercentage
          const offAmt = Math.round(price * ooffp/100)
          const offprice = price - offAmt
          const id = req.params.id

              
              await productmodel.updateOne({_id:id},{$set:{
                  productName:req.body.productName,
                  category:req.body.category,
                  StockQuantity:req.body.StockQuantity,
                  price:req.body.price,
                  description:req.body.description,
                  offName:req.body.offName,
                  offPercentage : req.body.offPercentage,
                  offPrice : offprice
              }})
              res.redirect('/admin/productList')
          
      } catch (error) {
          console.log(error.message);
      }
  }
}



// =================== UPDATE IMAGE ==============

const updateimage = async (req, res) => {

  try {

    const id = req.params.id
    const prodata = await productmodel.findOne({ _id: id })
    const imglength = prodata.image.length

    if (imglength <= 10) {
      let images = []
      for (file of req.files) {
        images.push(file.filename)
      }

      if (imglength + images.length <= 10) {

        const updatedata = await productmodel.updateOne({ _id: id }, { $addToSet: { image: { $each: images } } })

        res.redirect("/admin/editProduct/" + id)
      } else {

        const productData = await productmodel.findOne({ _id: id }).populate('category')
        const adminData = await User.findById({_id:req.session.Auser_id})
        const categoryData = await categorymodel.find()
        res.render('editProduct', { admin:adminData,products: productData, category: categoryData , imgfull: true})

      }

    } else {
      res.redirect("/admin/editProduct/")
    }

  } catch (error) {
    console.log(error.message);
  }

}

//===DELETE IMAGE=======
const deleteimage = async(req,res)=>{
  try{
    const imgid =req.params.imgid
    const prodid =req.params.prodid
    
    fs.unlink(path.join(__dirname,"../public/adminAssets/adminImages/",imgid),()=>{})
    const productimg  = await  productmodel.findByIdAndUpdate(prodid,{$pull:{image:imgid}})

    res.redirect(`/admin/editProduct/${prodid}`)



  }catch(error){
    console.log(error.message)
  }

}


module.exports = {
  productList,
  insertProduct,
  deleteProduct,
  editProduct,
  updateimage,
  deleteimage ,
  editUpdateProduct
}


const session = require("express-session");
const productmodel = require("../Model/productModel");
const categorymodel = require("../Model/categoryModel");
const usermodal = require("../Model/userModel");
const fs =require("fs")
const path = require("path")

const productList = async (req, res) => {
  try {
    const productData = await productmodel.find({});
    const adminData = await usermodal.findById({ _id: req.session.Auser_id });
    res.render("productList", { products: productData, admin: adminData });
  } catch (error) {
    console.log(error.message);
  }
};

const AddProducts = async (req, res) => {
  try {
    const productData = await productmodel.find({});
    const categoryData = await categorymodel.find({ is_delete: false });
    const adminData = await usermodal.findById({ _id: req.session.Auser_id });

    res.render("addProduct", {
      category: categoryData,
      products: productData,
      admin: adminData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const insertProduct = async (req, res) => {
  try {
    const image = [];
    if (req.files && req.files.length > 0) {
      for (i = 0; i < req.files.length; i++) {
        image[i] = req.files[i].filename;
      }
    }
    // const category = await categorymodel.findById(req.body.id);
    const new_product = new productmodel({
      productName: req.body.productName,
      price: req.body.price,
      image: image,
      //idealfor: req.body.idealfor,
     // brand: req.body.brand,
      category: req.body.category,
      StockQuantity: req.body.StockQuantity,
      description: req.body.description,
    });
    const productData = await new_product.save();
    if (productData) {
      // const categoryData = await categorymodel.find({})
      return res.redirect("/admin/addProduct");
    } else {
      return res.redirect("/admin/addProduct");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const dlt = await productmodel.deleteOne({ _id: id });
    if (dlt) {
      res.redirect("/admin/productList");
    } else {
      res.redirect("/admin/productList");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// const editProduct = async (req, res) => {
//   try {
//     const id = req.query.id;
//     // const category = await categorymodel({})
//     const category = await categorymodel.find({ is_delete: false });

//     const prodata = await productmodel.findById({ _id: id });
//     const adminData = await usermodal.findById({ _id: req.session.Auser_id });
//     if (prodata) {
//       res.render("editProduct", { product: prodata, admin: adminData ,category:category});
//     } else {
//       res.redirect("/admin/dashboard");
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };
//====================SHOW EDIT PRODUCT===
const editProduct = async(req,res) => {
  try {
     
     const id = req.params.id
     console.log(id,"haaaaaai");
     const productData = await productmodel.findOne({_id:id}).populate('category')
     const catData = await categorymodel.find()
     const adminData = await usermodal.findById({_id:req.session.Auser_id})
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
      const categoryData =categorymodel.find()
      const adminData = await usermodal.findById({_id:req.session.Auser_id})
      res.render('editProduct',{admin:adminData,products: productData, message:"All fields required",categorydata:categoryData})
  }else{
      try {
          const arrayimg = []
          for(file of req.files){
              arrayimg.push(file.filename)
          }
          
              
              const id = req.params.id
              // console.log("data : "+req.body.productName);
              await productmodel.updateOne({_id:id},{$set:{
                  productName:req.body.productName,
                  category:req.body.category,
                  // brand:req.body.brand,
                  StockQuantity:req.body.StockQuantity,
                  price:req.body.price,
                  description:req.body.description
              }})
              res.redirect('/admin/productList')
          // }
      } catch (error) {
          console.log(error.message);
      }
  }
}


// const updateProduct = async (req,res) =>{
//   if(req.body.productName.trim()=== "" || req.body.category.trim() === "" || req.body.description.trim() === "" || req.body.StockQuantity.trim() === "" || req.body.price.trim() === "" ) {
//       const id = req.params.id
//       const productData = await productmodel.findOne({_id:id}).populate('category')
//       const categoryData =categorymodel.find()
//       const adminData = await usermodal.findById({_id:req.session.Auser_id})
//       res.render('editProduct',{admin:adminData,products: productData, message:"All fields required",categorydata:categoryData})
//   }else{
//       try {
//           const arrayimg = []
//           for(file of req.files){
//               arrayimg.push(file.filename)
//           }
          
              
//               const id = req.params.id
//               // console.log("data : "+req.body.productName);
//               await productmodel.updateOne({_id:id},{$set:{
//                   productName:req.body.productName,
//                   category:req.body.category,
//                   brand:req.body.brand,
//                   StockQuantity:req.body.StockQuantity,
//                   price:req.body.price,
//                   description:req.body.description
//               }})
//               res.redirect('/admin/productList')
//           // }
//       } catch (error) {
//           console.log(error.message);
//       }
//   }
// }
// const updateProduct = async (req, res) => {
//     try {
//       for (let i = 0; i < req.files.length; i++) {
//         const imageupload = req.files[i].path;
//         const uploadResponse = await cloudinary.uploader.upload(imageupload);
//         const imageURL = uploadResponse.secure_url;
//         const productUpdate = await productmodel.updateOne(
//           { _id: req.query.id },
//           { $push: { image: imageURL } }
//         );
//         console.log(productUpdate);
//       }
//     if (req.files && req.files.length > 0) {
//         console.log('inner');
//       for (i = 0; i < req.files.length; i++) {
//         image[i] = req.files[i].filename;
//       }
//     }
  
//     const image = [];
//     if (req.files && req.files.length > 0) {
//       for (i = 0; i < req.files.length; i++) {
//         image[i] = req.files[i].filename;
//       }
//     }
//     // console.log("inside up");
//       const productUpdate = await productmodel.findByIdAndUpdate(
//         { _id: req.query.id },
//         {
//           $set: {
//             productName: req.body.name,
//             description: req.body.description,
//             price: req.body.price,
//             quantity: req.body.quantity,
//             category: req.body.category,
//             brand: req.body.brand,
//             status: 0,
//           },
//         }
//       );

//       const productData = await productUpdate.save();
//       if (productData) {
//         res.redirect("/admin/productList");
//         } else {
//             res.redirect("/admin/productList");
//             }
//     } catch (error) {
//       console.log(error);
//     }
//   };

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
        const adminData = await usermodal.findById({_id:req.session.Auser_id})
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
const deleteimage = async(req,res)=>{
  try{
    const imgid =req.params.imgid
    console.log(imgid);
    const prodid =req.params.prodid
    
    fs.unlink(path.join(__dirname,"../public/adminAssets/adminImages/",imgid),()=>{})
    const productimg  = await  productmodel.updateOne({_id:prodid},{$pull:{image:imgid}})

    res.redirect('/admin/editProduct/'+prodid)



  }catch(error){
    console.log(error.message)
  }

}


module.exports = {
  productList,
  AddProducts,
  insertProduct,
  deleteProduct,
  editProduct,
  updateimage,
 // updateProduct,
  deleteimage ,
  editUpdateProduct
}


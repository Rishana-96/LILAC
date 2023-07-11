const User = require('../Model/userModel')
const bannermodel = require('../Model/bannerModel')

//============== LOAD BANNER MANAGEMENT=====

const loadBannerManagement =  async(req,res) =>{
    try {
      const adminData = await User.findById({ _id: req.session.Auser_id });
        const banners = await bannermodel.find()
        res.render("bannerManagement",{admin:adminData,banners})
    } catch (error) {
        console.log(error.meassage);
    }
}

//================ ADD BANNER ====================

const addBanner = async (req,res) =>{
    try {
      const heading = req.body.heading
      let image ='';
      if(req.file){
        image = req.file.filename
      }
      const Banner = new bannermodel({
        heading:heading,
        image:image
      })
      Banner.save()
      console.log(Banner);
      res.redirect("/admin/banner")
    } catch (error) {
      console.log(error.message);
    }
  }

  //================ EDIT BANNER ====================

const editBanner = async (req,res) =>{

    try {
     
      const id = req.body.id
      const heading = req.body.heading
      let image = req.body.img
  
      if(req.file){
        image = req.file.filename
      }
      await bannermodel.findOneAndUpdate({_id:id},{
        $set:{
          heading:heading,
          image:image
        }
      })
      res.redirect("/admin/banner")
    } catch (error) {
    console.log(error.message);
    }
  }

  // =================== DELETE BANNER ===============

const deleteBanner = async(req,res) => {
  try {
    const id = req.body.id
    const deleteBanner = await bannermodel.findByIdAndDelete(id)
    if(deleteBanner){
      res.redirect("/admin/banner")
    }else{
      res.redirect("/admin/banner")
    }
  } catch (error) {
    console.log(error.message);
  }
}



module.exports = {
    loadBannerManagement,
    addBanner,
    editBanner,
    deleteBanner
}
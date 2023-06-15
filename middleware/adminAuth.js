
const isLogin = async (req, res, next) => {
    try {
      if (req.session.Auser_id) {
        // User is logged in, continue to next middleware or route handler
        next();
      } else {
        // User is not logged in, redirect to login page
        res.redirect("/admin");
      }
    } catch (err) {
      console.log(err.message);
      next(err);
    }
  };
 
  const isLogout = async (req, res, next) => {
    try {
      if (req.session.Auser_id) {
        res.redirect("/admin/dashboard");
      } else{
        next();
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  module.exports = {
    isLogin,
    isLogout,
  };
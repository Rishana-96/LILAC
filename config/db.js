const dotenv = require('dotenv')
dotenv.config();

const connection=()=>{
    const mongoose = require("mongoose");
    mongoose.connect(process.env.mongo);
    }
    
    module.exports={
        connection
    }
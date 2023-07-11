const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
    heading:{
        type:String
    },
    image:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('banner',bannerSchema)
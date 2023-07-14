const mongoose=require('mongoose')

const productSchemaa=new mongoose.Schema({
    productName : {
        type :String,
        required :true,
    },
  
    price : {
       type : Number,
       required:true
    },
    offName:{
        type:String,
    },
    offPercentage :{
        type : Number,
        default:0
    },
    offPrice : {
        type: Number,
        
    },
    image:{
        type : Array,
        required: true
    },
 
    category : {     
        type : String,
        required:true,
    },
    StockQuantity:{
        type :Number,
        required:true,
    },
    Status:{
        type :Boolean,
        default:true
    },
    description : {
        type :String,
        required:true,
    }
})

module.exports = mongoose.model ('product',productSchemaa);
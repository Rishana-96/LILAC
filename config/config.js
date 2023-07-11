const dotenv = require('dotenv')
dotenv.config();

const sessionSecret= process.env.secret

module.exports={
    sessionSecret
}
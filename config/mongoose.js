const mongoose = require('mongoose')

const mongoDB = mongoose.connect(
  process.env.MONGODB_URL,
  {
    maxPoolSize: 10,
    dbName: process.env.MONGODB_DBNAME
  },
  mongoose.set('strictQuery', true)
)

module.exports = mongoDB



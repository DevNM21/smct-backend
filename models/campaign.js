const mongoose = require("mongoose")

const campaignSchema = new mongoose.Schema({
  token : {type : String, required : true},
  title : {type : String, required : true},
  image : String,
  createdAt : Date,
  publisehdAt: Date,
  published : {
    fb : {type : Boolean, default : false},
    twitter : {type : Boolean, default : false}
  }
})

campaignSchema.statics.new = async (token, title, imageName) => {
  return await new Campaign({
    token : token,
    title : title,
    image : imageName,
    createdAt : Date().toLocaleString()
  }).save()
}

const Campaign = new mongoose.model("Campaign", campaignSchema)
module.exports = Campaign
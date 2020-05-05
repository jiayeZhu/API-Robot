const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  uuid: String,
  attacks: {
    type:[{type: Schema.Types.ObjectId, ref: 'Attack'}],
    default:[]
  }
},{timestamps:true})

module.exports = mongoose.model('user',userSchema)
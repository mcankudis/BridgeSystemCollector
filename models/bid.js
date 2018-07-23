var db = require('../db')
const Schema = db.Schema;

const bidsSchema = new Schema({
  bid:          {type: String, required: true},
  description:  {type: String, required: true},
  sequence:     {type: Array, required: true},
  twoSide:      {type: Boolean, required: true},
  date:         {type: Date, required: true, default: Date.now},
  index:        {type: Array, required: true},
  convention:   {type: String, required: false},
  group:        {type: String, required: true},
  postedBy:     {type: String, required: true}
});

const Bid = db.model('bid', bidsSchema);
module.exports = Bid;

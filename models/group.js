var db = require('../db')
const Schema = db.Schema;

const groupSchema = new Schema({
    name:         {type: String, required: true},
    description:  {type: String},
    users:        {type: Array, required: true},
    admins:       {type: Array, required: true},
    createdBy:    {type: String, required: true},
    date:         {type: Date, default: Date.now, required: true}
});

const Group = db.model('group', groupSchema);
module.exports = Group;

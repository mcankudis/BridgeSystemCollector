'use strict';
const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../config/ensureAuthenticated');
const Group = require('../models/group');
const User = require('../models/user');
const Bid = require('../models/bid');
const sanitize = require('../config/sanitize');
const mongoose = require('mongoose');

// GET ALL BIDS
router.get('/bids', ensureAuthenticated, function(req, res, next) {
  let chosenGroup = req.headers['x-group'];
  // sanitize section
  if(!sanitize.verifyWord(chosenGroup)) return res.sendStatus(401);
  // eof sanitize section
  Group.findOne({_id: chosenGroup}, function(err, grp) {
    if(err) return res.sendStatus(401);
    if(!grp) return res.sendStatus(401);
    if(grp.users.indexOf(req.auth.id)!=-1) {                    //make sure user is in the group
      Bid.find({group: grp._id}, function(err, bids) {
        if(err) return res.sendStatus(404);
        res.json(bids)
      })
    } else return res.sendStatus(401);
  })
})

// GET RESPONSES AFTER A SPECIFIED BID
router.get('/bid', ensureAuthenticated, function(req, res) {
  let chosenGroup = req.headers['x-group'];
  let sequence = req.headers['x-sequence'];
  if(sequence) sequence = sequence.split(",");
  else sequence = [];

  // sanitize section
  if(!sanitize.verifyWord(chosenGroup)) return res.sendStatus(401);
  for (let i = 0; i < sequence.length; i++) {
    if(!sanitize.verifyNumber(sequence[i])) return res.sendStatus(401);
  }
  // eof sanitize section
  Group.findOne({_id: chosenGroup}, function(err, grp) {
    if(err) return res.sendStatus(401);
    if(!grp) return res.sendStatus(401);
    if(grp.users.indexOf(req.auth.id)!=-1) {                    //make sure user is in the group
      Bid.find({group: grp._id, sequence: sequence}, function(err, bids) {
        if(err) return res.sendStatus(404);
        res.json(bids);
      })
    } else {
      res.sendStatus(401);
    }
  })
})

// GET BIDS IN A SPECIFIED CONVENTION
router.get('/bidByC', ensureAuthenticated, function(req, res) {
  let chosenGroup = req.headers['x-group'];
  let convention = req.headers['x-convention'];
  // sanitize section
  if(!sanitize.verifyWord(chosenGroup)) return res.sendStatus(401);
  if(!sanitize.verifyWord(convention)) return res.sendStatus(401);
  // eof sanitize section
  Group.findOne({_id: chosenGroup}, function(err, grp) {
    if(err) return res.sendStatus(401);
    if(!grp) return res.sendStatus(401);
    if(grp.users.indexOf(req.auth.id)!=-1) {                            //make sure user is in the group
      console.log(convention);
      Bid.find({group: grp._id, convention: convention}, function(err, bids) {
        if(err) return res.sendStatus(404);
        console.log(bids);
        res.json(bids);
      })
    } else {
      res.sendStatus(401);
    }
  })
})

// ADD MANY BIDS
router.post('/bids', ensureAuthenticated, function(req, res, next) {
  let chosenGroup = req.body.chosenGroup;
  let entries = [];
  // sanitize section
  if(!sanitize.verifyWord(chosenGroup)) return res.sendStatus(401);
  for (let i = 0; i < req.body.entries.length; i++) {
    if(!sanitize.verifyString(req.body.entries[i].bid)) return res.sendStatus(401);
    if(!sanitize.verifyString(req.body.entries[i].description)) return res.sendStatus(401);
    if(!sanitize.verifyBool(req.body.entries[i].twoSide)) return res.sendStatus(401);
    //if(!verifyNumber(req.body.entries[i].index)) return res.sendStatus(401);
    if(req.body.convention) if(!sanitize.verifyString(req.body.convention)) return res.sendStatus(401);
    for (let j = 0; j < req.body.entries[i].sequence.length; j++) {
      if(!sanitize.verifyNumber(req.body.entries[i].sequence[j])) return res.sendStatus(401);
    }
    let newBid = new Bid({
      bid:          req.body.entries[i].bid,
      description:  req.body.entries[i].description,
      sequence:     req.body.entries[i].sequence,
      twoSide:      req.body.entries[i].twoSide,
      index:        req.body.entries[i].index,
      convention:   req.body.convention,
      group:        chosenGroup,
      postedBy:     req.auth.username
    })
    entries.push(newBid);
  }
  // eof sanitize section
  Group.findOne({_id: chosenGroup}, function(err, grp) {
    if(err) return res.sendStatus(401);
    if(!grp) return res.sendStatus(401);
    if(grp.users.indexOf(req.auth.id)!=-1) {                      //make sure user is in the group
      Bid.collection.insert(entries, function(err, entries) {
        if(err) res.sendStatus(500);
        res.json(entries);
      })
    } else return res.sendStatus(401);
  })
})

// UPDATE MANY BIDS
router.post('/upBids', ensureAuthenticated, function(req, res, next) {
  let chosenGroup = req.body.chosenGroup
  let entries = [];
  // sanitize section
  if(!sanitize.verifyWord(chosenGroup)) return res.sendStatus(401);
  if(req.body.convention) if(!sanitize.verifyString(req.body.convention)) return res.sendStatus(401);
  for (let i = 0; i < req.body.updates.length; i++) {
    if(!sanitize.verifyString(req.body.updates[i].description)) return res.sendStatus(401);
    let newBid = {
      description:  req.body.updates[i].description,
      _id:          req.body.updates[i]._id
    }
    entries.push(newBid);
  }
  // eof sanitize section
  Group.findOne({_id: chosenGroup}, function(err, grp) {
    if(err) return res.sendStatus(401);
    if(!grp) return res.sendStatus(401);
    if(grp.users.indexOf(req.auth.id)!=-1) {                            //make sure user is in the group
      let bulkUpdates = [];
      for (let i = 0; i < entries.length; i++) {
        let tmp = {
          updateOne: {
            "filter": { _id : mongoose.Types.ObjectId(entries[i]._id)},
            "update": {$set: { "description" : entries[i].description}}
          }
        }
        if(req.body.convention) tmp.updateOne.update.$set.convention = req.body.convention;
        bulkUpdates.push(tmp);
      }
      Bid.collection.bulkWrite(bulkUpdates, function(err, result) {
        if(err) return res.sendStatus(404);
        if(result.matchedCount===0) return res.sendStatus(404);
        return res.sendStatus(200);
      })
    } else return res.sendStatus(401);
  })
})

// -----------------------------
// GROUPS API
// -----------------------------

// ADD GROUP
router.post('/group', ensureAuthenticated, function(req, res) {
  // sanitize section
  if(!sanitize.verifyString(req.body.name)) return res.sendStatus(401);
  if(!sanitize.verifyString(req.body.description)) return res.sendStatus(401);
  // eof sanitize section
  let newGroup = new Group({
    name: req.body.name,
    description: req.body.description,
    users: [req.auth.id],
    admins: [req.auth.id],
    createdBy: req.auth.username
  });
  newGroup.save(function(err, group) {
    if(err) return res.sendStatus(503);
    res.json(group);
  })
})

// ADD A USER TO THE GROUP
router.post('/addUserToGroup', ensureAuthenticated, function(req, res) {
  let group = req.body.group, userToAdd = req.body.user, user = req.auth.id;
  // sanitize section
  if(!sanitize.verifyWord(group)) return res.sendStatus(401);
  if(!sanitize.verifyWord(userToAdd)) return res.sendStatus(401);
  // eof sanitize section
  User.findOne({_id: user}, function(err, usr) {
    if(err) return res.sendStatus(401);
    if(!usr) return res.sendStatus(401);
    Group.findOne({_id: group}, function(err, grp) {
      if(err) return res.sendStatus(401);
      if(!grp) return res.sendStatus(401);
      if(grp.admins.indexOf(usr._id)!=-1) {
        Group.updateOne({_id: grp._id}, {$addToSet: {users: [userToAdd]}}, function(err) {
          if(err) return res.sendStatus(401);
          return res.sendStatus(200);
        })
      } else {return res.sendStatus(401);}
    })
  })
})

// REMOVE A USER FROM GROUP
router.post('/removeUserFromGroup', ensureAuthenticated, function(req, res) {
  let group = req.body.group, userToRemove = req.body.user, user = req.auth.id;
  // sanitize section
  if(!sanitize.verifyWord(group)) return res.sendStatus(401);
  if(!sanitize.verifyWord(userToRemove)) return res.sendStatus(401);
  // eof sanitize section
  User.findOne({_id: user}, function(err, usr) {
    if(err) return res.sendStatus(401);
    if(!usr) return res.sendStatus(401);
    Group.findOne({_id: group}, function(err, grp) {
      if(err) return res.sendStatus(401);
      if(!grp) return res.sendStatus(401);
      if(grp.admins.indexOf(usr._id)!=-1||userToRemove==user) {
        if(grp.admins.indexOf(userToRemove)==-1) {
          Group.updateOne({_id: grp._id}, {$pull: {users: userToRemove}}, function(err) {
            if(err) return res.sendStatus(404);
            return res.sendStatus(200);
          })
        } else return res.sendStatus(401);
      } else return res.sendStatus(401);
    })
  })
})

// ADD A USER TO GROUP'S ADMINS
router.post('/addUserToAdmins', ensureAuthenticated, function(req, res) {
  let group = req.body.group, userToAdd = req.body.user, user = req.auth.id;
  // sanitize section
  if(!sanitize.verifyWord(group)) return res.sendStatus(401);
  if(!sanitize.verifyWord(userToAdd)) return res.sendStatus(401);
  // eof sanitize section
  User.findOne({_id: user}, function(err, usr) {
    if(err) return res.sendStatus(401);
    if(!usr) return res.sendStatus(401);
    Group.findOne({_id: group}, function(err, grp) {
      if(err) return res.sendStatus(401);
      if(!grp) return res.sendStatus(401);
      if(grp.admins.indexOf(usr._id)!=-1) {
        if(grp.users.indexOf(userToAdd)!=-1) {
          Group.updateOne({_id: grp._id}, {$addToSet: {admins: [userToAdd]}}, function(err) {
            if(err) return res.sendStatus(401);
            return res.sendStatus(200);
          })
        } else return res.sendStatus(401);
      } else return res.sendStatus(401);
    })
  })
})

// REMOVE A USER FROM GROUP'S ADMINS
router.post('/removeUserFromAdmins', ensureAuthenticated, function(req, res) {
  let group = req.body.group, userToRemove = req.body.user, user = req.auth.id;
  // sanitize section
  if(!sanitize.verifyWord(group)) return res.sendStatus(401);
  if(!sanitize.verifyWord(userToRemove)) return res.sendStatus(401);
  // eof sanitize section
  User.findOne({_id: user}, function(err, usr) {
    if(err) return res.sendStatus(401);
    if(!usr) return res.sendStatus(401);
    Group.findOne({_id: group}, function(err, grp) {
      if(err) return res.sendStatus(401);
      if(!grp) return res.sendStatus(401);
      if(grp.admins.indexOf(usr._id)!=-1) {
        Group.updateOne({_id: grp._id}, {$pull: {admins: userToRemove}}, function(err) {
          if(err) return res.sendStatus(404);
          return res.sendStatus(200);
        })
      } else {return res.sendStatus(401);}
    })
  })
})

// GET ALL GROUPS THE USER IS IN
router.get('/groups', ensureAuthenticated, function(req, res, next) {
  Group.find({users: req.auth.id}, function(err, groups) {
    if(err) return res.sendStatus(404);
    if(!groups) return res.sendStatus(404);
    res.json(groups);
  })
})

module.exports = router

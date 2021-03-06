'use strict';

let getRandomString = function(mini, maxi) {
  let tmp = Math.ceil(Math.random()*(maxi-mini))+mini;
  let helper = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let string = '';
  for (let i = 0; i < tmp; i++) {
    let rand = Math.floor(Math.random()*59);
    string+=helper[rand];
  }
  return string;
}

let sec = 'qwgfretg43qt56uhmc845DFS12th5t43Ebthst21yxB3r';

let CronJob = require('cron').CronJob;
new CronJob('0 0 12 * * *', function() {
  sec = getRandomString(50,60);
  console.log(sec);
}, null, true, 'America/Los_Angeles');

module.exports = {
        tokenAuth: {
            secret: sec
        }
};

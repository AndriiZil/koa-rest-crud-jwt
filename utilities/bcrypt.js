const bcrypt = require('bcrypt-nodejs');

const hash = data => new Promise(async (resolve, reject) => {
  // We cannot pass process.env.SALT_ROUNDS instead salt // only null or get salt with func
  bcrypt.hash(data, null, null, (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
});

const compare = (data, encrypted) => new Promise((resolve, reject) => {
  bcrypt.compare(data, encrypted, (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
});

module.exports = {
  hash,
  compare,
};

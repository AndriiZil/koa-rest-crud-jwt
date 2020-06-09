const User = require('../../models/User');
const schemaValidator = require('../service/schema');

const { validatePassword, validateEmail } = require('../../utilities/validators');
const { hash, compare } = require('../../utilities/bcrypt');

class UserService {

  async getUserByEmail(email) {
    return User.findOne({ email });
  }

  async createNewUser(email, hashedPassowrd) {
    const user = new User({
      email,
      password: hashedPassowrd
    });

    return user.save();
  }

}

module.exports = new UserService();
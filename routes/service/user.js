const User = require('../../models/User');

class UserService {

  /**
   * Get user by email
   * @param {String} email
   * @returns {Promise<void>}
   */
  static async getUserByEmail(email) {
    return User.findOne({ email });
  }

  /**
   * Create new user
   * @param {String} email
   * @param {String} hashedPassowrd
   * @returns {Promise<void|Promise|*>}
   */
  static async createNewUser(email, hashedPassowrd) {
    const user = new User({
      email,
      password: hashedPassowrd
    });

    return user.save();
  }

}

module.exports = UserService;
/**
 * Validate Password by regular expression
 * @param {String} password
 * @returns {boolean}
 */
const validatePassword = password => {
  const re = /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/;

  if (re.test(password)) {
    return true;
  } else if (!password) {
    const error = new Error('Password doesn\'t specified.');
    error.code = 422;
    throw error;
  } else {
    throw new Error('Password should be stronger.');
  }
}

/**
 * Validate email by regular expression
 * @param {String} email
 * @returns {boolean}
 */
const validateEmail = email => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  if (re.test(email)) {
    return true;
  } else if (!email) {
    throw new Error('Email doesn\'t specified.');
  } else {
    const error = new Error('Email is incorrect.');
    error.code = 422;
    throw error;
  }
}

module.exports = {
  validatePassword,
  validateEmail
}
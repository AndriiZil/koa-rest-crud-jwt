const jwt = require('jsonwebtoken');
const { promisify } = require('util');

module.exports = () => {
  return async (ctx, next) => {
    if (!ctx.headers.authorization) {
      ctx.throw(403, 'No token provided.');
    }

    const token = ctx.headers.authorization.split(' ')[1];

    try {
      jwt.verify = promisify(jwt.verify);
      ctx.request.jwtPayload = await jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      ctx.throw(err.status || 403, err.text);
    }

    await next();
  }
};

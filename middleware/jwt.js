const jwt = require('jsonwebtoken');

module.exports = async (ctx, next) => {
  if (!ctx.headers.authorization) {
    ctx.throw(403, 'No token provided.');
  }

  const token = ctx.headers.authorization.split(' ')[1];

  try {
    ctx.request.jwtPayload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    ctx.throw(err.status || 403, err.text);
  }

  await next();
};

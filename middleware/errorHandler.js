module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.message && String(err.message).startsWith('Cast to ObjectId failed for value')) {
      err.status = 404;
      err.message = 'Not defined.'
    }
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      message: err.message
    };
  }
};

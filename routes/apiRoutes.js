const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const jwt = require('jsonwebtoken');

const { transformPosts, transformPost, transformUser } = require('../utilities/helpers');
const { getCreatorId } = require('../utilities/helpers');
const { validateEmail, validatePassword } = require('../utilities/validators');
const { hash, compare } = require('../utilities/bcrypt');

const schemaValidator = require('../routes/service/schema');
const userService = require('../routes/service/user');
const postService = require('../routes/service/post');

const router = new Router();

const authenticated = require('../middleware/jwt');

/**
 * @api {post} /register Register new User
 * @apiName Register User
 * @apiGroup User
 *
 * @apiVersion 1.0.0
 *
 * @apiParam (Body) {String} email Email for registration new user.
 * @apiParam (Body) {String} password Password for registration new user.
 *
 * @apiParamExample {json} Body:
 *      {
 *        "email": "example@example.com",
 *        "password": "c26aRdf1#As%651$D"
 *      }
 *
 * @apiSuccess {String} success indicates the status of procedure.
 * @apiSuccess {Object} body returned body.
 * @apiSuccess {Array} createdPosts array with created posts.
 * @apiSuccess {String} body._id Id of user.
 * @apiSuccess {String} body.email Email of user.
 * @apiSuccess {String} body.password Password of user.
 * @apiSuccess {String} body.createdAt Created at date.
 * @apiSuccess {String} body.updatedAt Updated at date.
 * @apiSuccess {String} body.__v Change version of user.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "message": "success",
 *         "body": {
 *             "userId": "5ede80413ca35e1cc40227fd",
 *             "email": "example@example.com",
 *             "created": "2020-06-08T18:35:06.444Z"
 *         }
 *      }
 *
 *
 * @apiErrorExample UserAlreadyExists:
 *     HTTP/1.1 422 Error
 *     {
 *        "success": false,
 *        "message": "User already exists."
 *     }
 *
 * @apiErrorExample NoEmailProvided:
 *     HTTP/1.1 400 Error
 *     {
 *        "success": false,
 *        "message": "should have required property 'email'"
 *     }
 *
 * @apiErrorExample NoPasswordProvided:
 *     HTTP/1.1 400 Error
 *     {
 *        "success": false,
 *        "message": "should have required property 'password'"
 *     }
 */
router.post('/register', bodyParser(), async (ctx) => {
  await schemaValidator.customSchemaValidation('register-user', ctx);

  const { email, password } = ctx.request.body;

  const dbUser = await userService.getUserByEmail(email);

  if (dbUser) {
    ctx.throw(422, 'User already exists.')
  }

  validateEmail(email);
  validatePassword(password);

  const hashedPassowrd = await hash(password)

  const user = await userService.createNewUser(email, hashedPassowrd);

  const transformedUser = transformUser(user)

  ctx.status = 201;
  ctx.body = { message: "success", body: transformedUser };
});

/**
 * @api {post} /login Login User
 * @apiName Login User
 * @apiGroup User
 *
 * @apiVersion 1.0.0
 *
 * @apiParam (Body) {String} email Email for login user.
 * @apiParam (Body) {String} password Password for login user.
 *
 * @apiParamExample {json} Body:
 *      {
 *        "email": "example@example.com",
 *        "password": "c26aRdf1#As%651$D"
 *      }
 *
 * @apiSuccess {String} token Token for headers.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "token": "eyJhbGciOiJIUzpXVCJ9.eyJpZCI6IjVlZGU1OTRjNzIwTY0MDQwNywiZXhwIjoxNTkxNjQ0MDA3fQ.Lp1FR5mtdBPkk_E4KSBwLUMbvCPYoK7FxC4YVjYvvYY"
 *      }
 *
 *
 * @apiErrorExample UserWasNotDefined:
 *     HTTP/1.1 422 Error
 *     {
 *        "success": false,
 *        "message": "User was not found."
 *     }
 *
 * @apiErrorExample UserWasNotDefined:
 *     HTTP/1.1 422 Error
 *     {
 *        "success": false,
 *        "message": "Password is invalid."
 *     }
 *
 * @apiErrorExample NoEmailProvided:
 *     HTTP/1.1 400 Error
 *     {
 *        "success": false,
 *        "message": "should have required property 'email'"
 *     }
 *
 * @apiErrorExample NoPasswordProvided:
 *     HTTP/1.1 400 Error
 *     {
 *        "success": false,
 *        "message": "should have required property 'password'"
 *     }
 */
router.post('/login', bodyParser(), async (ctx) => {
  await schemaValidator.customSchemaValidation('login-user', ctx);

  const { email, password } = ctx.request.body;

  const dbUser = await userService.getUserByEmail(email);

  if (!dbUser) {
    ctx.throw(422, 'User was not found.');
  }

  const isValidPassword = await compare(password, dbUser.password);

  if (!isValidPassword) {
    ctx.throw(422, 'Password is invalid.');
  }

  const payload = { id: dbUser.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  ctx.body = { token };
});

/**
 * @api {post} /posts Create new post
 * @apiName Create new post
 * @apiGroup Post
 *
 * @apiVersion 1.0.0
 *
 * @apiParam (Body) {String} email Email for login user.
 * @apiParam (Body) {String} password Password for login user.
 *
 * @apiParamExample {json} Body:
 *      {
 *        "title": "some title",
 *        "description": "some description"
 *      }
 *
 * @apiHeaderExample {json} Header-Response:
 *     {
 *        "Authorization": "eyJhbGciOiJIUzpXVCJ9.eyJpZCI6IjVlZGU1OTRjNzIwTY0MDQwNywiZXhwIjoxNTkxNjQ0MDA3fQ.Lp1FR5mtdBPkk_E4KSBwLUMbvCPYoK7FxC4YVjYvvYY"
 *     }
 *
 * @apiSuccess {String} success indicates the status of procedure.
 * @apiSuccess {Object} post created post.
 * @apiSuccess {String} body._id Id of created post.
 * @apiSuccess {String} body.title title of created post.
 * @apiSuccess {String} body.description description of created post.
 * @apiSuccess {String} body.postedBy Id of posted user.
 * @apiSuccess {String} body.createdAt Created at date.
 * @apiSuccess {String} body.updatedAt Updated at date.
 * @apiSuccess {String} body.__v Change version of user.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *         "message": "success",
 *         "post": {
 *             "id": "5ede84916ffcb72385737444",
 *             "title": "title",
 *             "description": "descr",
 *             "ownerId": "5ede594c72055e463944e832",
 *             "created": "2020-06-08T18:33:53.833Z",
 *             "updated": "2020-06-08T18:33:53.833Z"
 *         }
 *    }
 * @apiErrorExample InvalidToken:
 *      {
 *         "success": false,
 *         "message": "Forbidden"
 *     }
 *
 * @apiErrorExample PostValidation:
 *      {
 *         "success": false,
 *         "message": "Post validation failed: title: Path `title` is required."
 *     }
 *
 * @apiErrorExample PostValidation:
 *      {
 *         "success": false,
 *         "message": "Post validation failed: description: Path `description` is required."
 *     }
 */
router.post('/posts', bodyParser(), authenticated, async (ctx) => {
  await schemaValidator.customSchemaValidation('create-update-post', ctx);

  const { title, description } = ctx.request.body;

  const creatorId = getCreatorId(ctx);

  const post = await postService.create(title, description, creatorId);

  const createdPost = transformPost(post);

  ctx.status = 201;
  ctx.body = { message: "success", post: createdPost };
});

/**
 * @api {get} /posts Get User's posts
 * @apiName Get Posts
 * @apiGroup Post
 *
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Body:
 *      {
 *        "title": "some title",
 *        "description": "some description"
 *      }
 *
 * @apiHeaderExample {json} Header-Response:
 *     {
 *        "Authorization": "eyJhbGciOiJIUzpXVCJ9.eyJpZCI6IjVlZGU1OTRjNzIwTY0MDQwNywiZXhwIjoxNTkxNjQ0MDA3fQ.Lp1FR5mtdBPkk_E4KSBwLUMbvCPYoK7FxC4YVjYvvYY"
 *     }
 *
 * @apiSuccess {String} token Token for headers.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *       "posts": [
 *           {
 *               "id": "5edf21ff3d16c33db5dfe7bb",
 *               "title": "title",
 *               "description": "descr",
 *               "owner": {
 *                   "id": "5edf1e893d3ed833ee04793d",
 *                   "email": "asd@gmail.com",
 *                   "created": "2020-06-09T05:30:49.455Z",
 *                   "updated": "2020-06-09T05:30:49.455Z"
 *               },
 *               "created": "2020-06-09T05:45:35.380Z",
 *               "updated": "2020-06-09T05:45:35.380Z"
 *           },
 *           {
 *               "id": "5edf22be0df77d3e6d0027b6",
 *               "title": "title",
 *               "description": "descr",
 *               "owner": {
 *                   "id": "5edf1e893d3ed833ee04793d",
 *                   "email": "asd@gmail.com",
 *                   "created": "2020-06-09T05:30:49.455Z",
 *                   "updated": "2020-06-09T05:30:49.455Z"
 *               },
 *               "created": "2020-06-09T05:48:46.922Z",
 *               "updated": "2020-06-09T05:48:46.922Z"
 *           },
 *           {
 *               "id": "5edf22f82aa64a3ecc8e7f43",
 *               "title": "title",
 *               "description": "descr",
 *               "owner": {
 *                   "id": "5edf1e893d3ed833ee04793d",
 *                   "email": "asd@gmail.com",
 *                   "created": "2020-06-09T05:30:49.455Z",
 *                   "updated": "2020-06-09T05:30:49.455Z"
 *               },
 *               "created": "2020-06-09T05:49:44.879Z",
 *               "updated": "2020-06-09T05:49:44.879Z"
 *           }
 *       ]
 *   }
 *
 * @apiErrorExample InvalidToken:
 *      {
 *         "success": false,
 *         "message": "Forbidden"
 *     }
 *
 * @apiErrorExample UserWasNotDefined:
 *     HTTP/1.1 500 Error
 *     {
 *        "success": false,
 *        "message": "User was not defined."
 *     }
 *
 * @apiErrorExample UserWasNotDefined:
 *     HTTP/1.1 500 Error
 *     {
 *        "success": false,
 *        "message": "User was not defined."
 *     }
 */
router.get('/posts', authenticated, async (ctx) => {
  try {
    const creatorId = getCreatorId(ctx);

    const posts = await postService.getAll();

    const postsById = transformPosts(posts, creatorId);

    ctx.body = { posts: postsById };
  } catch (e) {
    ctx.throw(e.code, e.message);
  }
});

/**
 * @api {get} /posts/:id Get User's post by id
 * @apiName Get Post By id
 * @apiGroup Post
 *
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Body:
 *      {
 *        "title": "some title",
 *        "description": "some description"
 *      }
 *
 * @apiHeaderExample {json} Header-Response:
 *     {
 *        "Authorization": "eyJhbGciOiJIUzpXVCJ9.eyJpZCI6IjVlZGU1OTRjNzIwTY0MDQwNywiZXhwIjoxNTkxNjQ0MDA3fQ.Lp1FR5mtdBPkk_E4KSBwLUMbvCPYoK7FxC4YVjYvvYY"
 *     }
 *
 * @apiSuccess {String} token Token for headers.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "token": "eyJhbGciOiJIUzpXVCJ9.eyJpZCI6IjVlZGU1OTRjNzIwTY0MDQwNywiZXhwIjoxNTkxNjQ0MDA3fQ.Lp1FR5mtdBPkk_E4KSBwLUMbvCPYoK7FxC4YVjYvvYY"
 *      }
 *
 * @apiErrorExample InvalidToken:
 *      {
 *         "success": false,
 *         "message": "Forbidden"
 *     }
 *
 * @apiErrorExample UserWasNotDefined:
 *     HTTP/1.1 500 Error
 *     {
 *        "success": false,
 *        "message": "User was not defined."
 *     }
 *
 * @apiErrorExample UserWasNotDefined:
 *     HTTP/1.1 500 Error
 *     {
 *        "success": false,
 *        "message": "User was not defined."
 *     }
 *
 * @apiErrorExample PostNotDefined:
 *     HTTP/1.1 404 Error
 *     {
 *        "success": false,
 *        "message": "Not defined."
 *     }
 */
router.get('/posts/:id', authenticated, async (ctx) => {
  const { id } = ctx.params;

  const post = await postService.getById(id);
  const singlePost = transformPost(post);

  ctx.body = { ...singlePost };
});

/**
 * @api {patch} /posts/:id Update Post
 * @apiName Login User
 * @apiGroup Post
 *
 * @apiVersion 1.0.0
 *
 * @apiParam (Body) {String} email Email for login user.
 * @apiParam (Body) {String} password Password for login user.
 *
 * @apiHeaderExample {json} Header-Response:
 *     {
 *        "Authorization": "eyJhbGciOiJIUzpXVCJ9.eyJpZCI6IjVlZGU1OTRjNzIwTY0MDQwNywiZXhwIjoxNTkxNjQ0MDA3fQ.Lp1FR5mtdBPkk_E4KSBwLUMbvCPYoK7FxC4YVjYvvYY"
 *     }
 *
 * @apiSuccess {String} token Token for headers.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "token": "eyJhbGciOiJIUzpXVCJ9.eyJpZCI6IjVlZGU1OTRjNzIwTY0MDQwNywiZXhwIjoxNTkxNjQ0MDA3fQ.Lp1FR5mtdBPkk_E4KSBwLUMbvCPYoK7FxC4YVjYvvYY"
 *      }
 *
 *
 * @apiErrorExample InvalidToken:
 *      {
 *         "success": false,
 *         "message": "Forbidden"
 *     }
 *
 * @apiErrorExample NotPostOwner:
 *     HTTP/1.1 500 Error
 *     {
 *        "success": false,
 *        "message": "You are not post's owner."
 *     }
 */
router.patch('/posts/:id', bodyParser(), authenticated, async (ctx) => {
  const { id } = ctx.params;

  await schemaValidator.customSchemaValidation('create-update-post', ctx);

  const creatorId = getCreatorId(ctx);

  const { title, description } = ctx.request.body;

  const post = await postService.getAll();

  if (creatorId !== post[0].postedBy._id.toString()) {
    ctx.throw(422, 'You are not post\'s owner.');
  } else {
    await postService.update(title, description, id);
  }

  ctx.body = { message: "success" };
});

/**
 * @api {delete} /posts/:id Delete Post
 * @apiName Delete Post
 * @apiGroup Post
 *
 * @apiVersion 1.0.0
 *
 * @apiHeaderExample {json} Header-Response:
 *     {
 *        "Authorization": "eyJhbGciOiJIUzpXVCJ9.eyJpZCI6IjVlZGU1OTRjNzIwTY0MDQwNywiZXhwIjoxNTkxNjQ0MDA3fQ.Lp1FR5mtdBPkk_E4KSBwLUMbvCPYoK7FxC4YVjYvvYY"
 *     }
 *
 * @apiSuccess {String} token Token for headers.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "token": "eyJhbGciOiJIUzpXVCJ9.eyJpZCI6IjVlZGU1OTRjNzIwTY0MDQwNywiZXhwIjoxNTkxNjQ0MDA3fQ.Lp1FR5mtdBPkk_E4KSBwLUMbvCPYoK7FxC4YVjYvvYY"
 *      }
 *
 *
 * @apiErrorExample TokenWasExpired:
 *     HTTP/1.1 500 Error
 *     {
 *        "success": false,
 *        "message": "Forbidden"
 *     }
 *
 * @apiErrorExample NotPostOwner:
 *     HTTP/1.1 500 Error
 *     {
 *        "success": false,
 *        "message": "You are not post's owner."
 *     }
 */
router.delete('/posts/:id', authenticated, async (ctx) => {
  const { id } = ctx.params;
  const creatorId = getCreatorId(ctx);

  const post = await postService.getById(id);

  if (!post) {
    ctx.throw(404, `Post with "${id}" id was not found.`);
  }

  if (creatorId !== post.postedBy.toString()) {
    ctx.throw(422, 'You are not post\'s owner.');
  } else {
    await postService.delete(id);
  }

  ctx.body = { message: "success" };
});

module.exports = router;
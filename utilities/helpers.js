const getCreatorId = (ctx) => {
  const {id: creatorId} = ctx.request.jwtPayload;

  if (!creatorId) {
    const error = new Error('User was not defined.');
    error.code = 422;
    throw error;
  } else {
    return creatorId;
  }
}

const transformPosts = (posts, creatorId) => {
  return posts
    .filter(post => post.postedBy._id.toString() === creatorId)
    .map(post => {
      return {
        id: post._id,
        title: post.title,
        description: post.description,
        owner: {
          id: post.postedBy._id,
          email: post.postedBy.email,
          created: post.postedBy.createdAt,
          updated: post.postedBy.updatedAt,

        },
        created: post.createdAt,
        updated: post.updatedAt
      }
    });
}

const transformPost = post => {
  return {
    id: post._id,
    title: post.title,
    description: post.description,
    ownerId: post.postedBy,
    created: post.createdAt,
    updated: post.updatedAt
  }
}

const transformUser = user => {
  return {
    userId: user._id,
    email: user.email,
    created: user.createdAt
  }
}

module.exports = {
  getCreatorId,
  transformPosts,
  transformPost,
  transformUser
}
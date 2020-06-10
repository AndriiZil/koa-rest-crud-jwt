const Post = require('../../models/Post');

class PostService {

  /**
   * Create new post
   * @param {String} title
   * @param {String} description
   * @param {Number} creatorId
   * @returns {Promise<void|Promise|*>}
   */
  static async create(title, description, creatorId) {
    const post = new Post({
      title,
      description,
      postedBy: creatorId,
      date: new Date()
    });

    return post.save();
  }

  /**
   * Get post by id
   * @param {String} id
   * @returns {Promise<void>}
   */
  static async getById(id) {
    return Post.findOne({ _id: id });
  }

  /**
   * Get all posts
   * @returns {Promise<void|[*]>}
   */
  static async getAll() {
    return Post.find().populate('postedBy');
  }

  /**
   * Update post
   * @param {String} title
   * @param {String} description
   * @param {Number} id
   * @returns {Promise<void|Query>}
   */
  static async update(title, description, id) {
    return Post.findOneAndUpdate({ _id: id }, {
      title,
      description
    });
  }

  /**
   * Delete post
   * @param {Number} id
   * @returns {Promise<Query>}
   */
  static async delete(id) {
    return Post.findOneAndRemove({_id: id});
  }

}

module.exports = PostService;
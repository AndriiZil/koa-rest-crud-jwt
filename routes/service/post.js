const Post = require('../../models/Post');
const User = require('../../models/User');
const schemaValidator = require('../service/schema');

const { getCreatorId } = require('../../utilities/helpers');

class postService {

  /**
   * Create new post
   * @param {String} title
   * @param {String} description
   * @param {Number} creatorId
   * @returns {Promise<void|Promise|*>}
   */
  async create(title, description, creatorId) {
    const post = new Post({
      title,
      description,
      postedBy: creatorId,
      date: new Date().toISOString()
    });

    return post.save();
  }

  /**
   * Get post by id
   * @param {String} id
   * @returns {Promise<void>}
   */
  async getById(id) {
    return Post.findOne({ _id: id });
  }

  /**
   * Get all posts
   * @returns {Promise<void|[*]>}
   */
  async getAll() {
    return Post.find().populate('postedBy');
  }

  /**
   * Update post
   * @param {String} title
   * @param {String} description
   * @param {Number} id
   * @returns {Promise<void|Query>}
   */
  async update(title, description, id) {
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
  async delete(id) {
    return Post.findOneAndRemove({_id: id});
  }

}

module.exports = new postService();
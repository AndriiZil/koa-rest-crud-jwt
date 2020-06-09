const mongoose = require('mongoose');

class DatabaseConnection {

  async getConnection() {
    const options = {
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    };

    try {
      await mongoose.connect(`mongodb+srv://${process.env.MONGO_CREDENTIALS}@cluster0-zxmde.mongodb.net/posts`, options);

      console.log('DATABASE CONNECTED');
    } catch (error) {
      console.log(error);
    }
  }

}

module.exports = new DatabaseConnection();
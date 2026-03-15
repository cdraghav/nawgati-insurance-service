import mongoose from 'mongoose';

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error', err);
  });

const collection = (name) => mongoose.connection.collection(name);

const mongo = {
  findOne: async (collectionName, query, options = {}) => {
    try {
      return await collection(collectionName).findOne(query, options);
    } catch (err) {
      err.type = 'MONGODB_ERROR';
      throw err;
    }
  },

  find: async (collectionName, query, options = {}) => {
    try {
      const { skip, limit, sort, ...rest } = options;
      let cursor = collection(collectionName).find(query, rest);
      if (sort) cursor = cursor.sort(sort);
      if (skip) cursor = cursor.skip(skip);
      if (limit) cursor = cursor.limit(limit);
      return await cursor.toArray();
    } catch (err) {
      err.type = 'MONGODB_ERROR';
      throw err;
    }
  },

  insertOne: async (collectionName, document) => {
    try {
      const result = await collection(collectionName).insertOne(document);
      return result.insertedId;
    } catch (err) {
      err.type = 'MONGODB_ERROR';
      throw err;
    }
  },

  updateOne: async (collectionName, filter, update, options = {}) => {
    try {
      return await collection(collectionName).updateOne(filter, update, options);
    } catch (err) {
      err.type = 'MONGODB_ERROR';
      throw err;
    }
  },

  aggregate: async (collectionName, pipeline) => {
    try {
      return await collection(collectionName).aggregate(pipeline).toArray();
    } catch (err) {
      err.type = 'MONGODB_ERROR';
      throw err;
    }
  },

  countDocuments: async (collectionName, query = {}) => {
    try {
      return await collection(collectionName).countDocuments(query);
    } catch (err) {
      err.type = 'MONGODB_ERROR';
      throw err;
    }
  },
};

export default mongo;

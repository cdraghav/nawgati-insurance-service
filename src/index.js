import 'dotenv/config';

process.env.TZ = 'Asia/Kolkata';

import '@babel/polyfill';
import { createServer } from 'http';
import mongoose from 'mongoose'; // 1. Added mongoose import
import app from './app';

const port = process.env.PORT || 4000;
const server = createServer(app);

mongoose
  .connect(process.env.MONGO_URI) 
  .then(() => {
    console.log('MongoDB connected successfully');
    server.listen(port, () => {
      console.log(`NawgatiInsuranceDashboardService is listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error. Server not started.', err);
    process.exit(1);
  });

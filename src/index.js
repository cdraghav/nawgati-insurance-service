import 'dotenv/config';

process.env.TZ = 'Asia/Kolkata';

import '@babel/polyfill';
import { createServer } from 'http';
import mongoose from 'mongoose';
import app from './app';

const port = process.env.PORT || 4000;
const server = createServer(app);
mongoose.set('bufferCommands', false);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection failed. Visit endpoints will not work.', err));

server.listen(port, () => {
  console.log(`NawgatiInsuranceDashboardService is listening on port ${port}`);
});


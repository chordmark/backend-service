import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import Routes from './routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
new Routes(app);
const port = process.env.PORT || 3001;

mongoose.connect('mongodb://localhost:27017/chordmark').then(() => {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
});

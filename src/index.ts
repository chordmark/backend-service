import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import Routes from './routes';

dotenv.config();

const app = express();
app.use(cors());
new Routes(app);
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

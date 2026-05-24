import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './modules/auth/routes';
import issuesRoutes from './modules/issues/routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

export default app;

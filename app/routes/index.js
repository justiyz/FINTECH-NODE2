import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello World' });
});

router.get('/healthcheck/ping', (req, res) => {
  res.status(200).json({ message: 'PONG' });
});

export default router;

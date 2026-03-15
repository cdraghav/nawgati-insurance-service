import express from 'express';
import usersRouter from './users';
import leadsRouter from './leads';
import visitsRouter from './visits';

const router = express.Router();

router.use('/users', usersRouter);
router.use('/leads', leadsRouter);
router.use('/visits', visitsRouter);

export default router;

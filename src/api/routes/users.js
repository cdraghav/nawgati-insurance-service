import express from 'express';
import { UserController } from '../controllers';

const router = express.Router();

router.post('/signin', UserController.signin);
router.post('/signup', UserController.signup);
router.post('/signout', UserController.signout);
router.get('/agents', UserController.getAgents);
router.get('/:userId([0-9]+)', UserController.getProfile);
router.put('/:userId([0-9]+)', UserController.updateProfile);

export default router;

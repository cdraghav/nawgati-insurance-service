import express from 'express';
import { VisitsController } from '../controllers';

const router = express.Router();

router.get('/', VisitsController.getVisits);
router.get('/:visitId', VisitsController.getVisit);

export default router;

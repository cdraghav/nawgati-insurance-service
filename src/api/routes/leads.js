import express from 'express';
import { LeadsController } from '../controllers';

const router = express.Router();

router.get('/', LeadsController.getLeads);
router.post('/reveal', LeadsController.revealLead);
router.get('/:id([0-9]+)', LeadsController.getLead);
router.put('/:id([0-9]+)/status', LeadsController.updateLeadStatus);

export default router;

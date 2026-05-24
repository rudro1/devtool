import { Router } from 'express';
import {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
} from './controller';
import { authenticate, authorizeMaintainer } from '../../middleware/auth';

const router = Router();

router.post('/', authenticate, createIssue);
router.get('/', getAllIssues);
router.get('/:id', getSingleIssue);
router.patch('/:id', authenticate, updateIssue);
router.delete('/:id', authenticate, authorizeMaintainer, deleteIssue);

export default router;

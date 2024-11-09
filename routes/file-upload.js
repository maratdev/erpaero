import { Router } from 'express';
import { authenticate } from '../controllers/auth.controller.js';
import {
  fileAllList,
  fileDelete, fileDownload,
  fileGetInfo, fileUpdate,
  fileUpload,
} from '../controllers/file.controller.js';
import { validationFileParams, validationFileQuery } from '../middlewares/validation.js';

const router = Router();

router.route('/upload').post(authenticate, fileUpload);
router.route('/list').get(authenticate, validationFileQuery, fileAllList);
router.route('/delete/:id').get(authenticate, validationFileParams, fileDelete);
router.route('/:id').get(authenticate, validationFileParams, fileGetInfo);
router.route('/update/:id').patch(authenticate, validationFileParams, fileUpdate);
router.route('/download/:id').get(authenticate, validationFileParams, fileDownload);

router.route('/download/:id').post((req, res) => {
	const filePath = '/my/file/path/...';
	const fileName = 'report.pdf';

	res.download(filePath, fileName);
});

export default router;

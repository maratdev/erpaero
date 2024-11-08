import { Router } from 'express';
import { authenticate } from '../controllers/auth.controller.js';
import { fileUpload } from '../controllers/file.controller.js';

const router = Router();

router.route('/upload').post(authenticate, fileUpload);
router.route('/download').post(
  (req, res) =>{
    const filePath = "/my/file/path/...";
    const fileName = "report.pdf";

    res.download(filePath, fileName);
  }
)

export default router;

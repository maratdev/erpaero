import multer from 'multer';
import crypto from 'crypto';
import { join, extname } from 'node:path';
import { format } from 'date-fns';
import pkg from 'app-root-path';
const { path } = pkg;
import { BadRequestError } from '../middlewares/errors/BadRequestError.js';
import { StatusCodes } from 'http-status-codes';
import fs from 'fs-extra';
import FilesUserModel from '../models/users/filesModel.js';



const dateFolder = format(new Date(), 'yyyy/MM/dd');
const getUploadDirectoryPath = (folder) => {
  return join(`${path}/uploads/${folder}`, dateFolder);
}
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const directory = getUploadDirectoryPath(req.user.userId)
      fs.mkdirpSync(directory, { recursive: true })
      cb(null, directory);
    },
    filename: (req, file, cb) => {
      const tempToken = crypto.randomUUID();
      cb(null, tempToken + extname(file.originalname));
    },
  }),
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB
  fileFilter: (req, file, cb) => {
    const extension = ['.png', '.jpg', '.jpeg'].indexOf(extname(file.originalname).toLowerCase()) >= 0;
    const mimeType = ['image/png', 'image/jpg', 'image/jpeg'].indexOf(file.mimetype) >= 0;
    if (extension && mimeType) {
      return cb(null, true);
    }
    cb(new BadRequestError('Неверный формат файла'));
  },
}).single('file');

export const fileUpload = async (req, res, next) => {
  try {
    upload(req, res, async (err) => {
      if (err instanceof BadRequestError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: err.message,
        });
      }
      if (err) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: err.message,
        });
      }
      const src = `/uploads/${req.user.userId}/${dateFolder}/${req.file.filename}`;
      await FilesUserModel.create({
        user_id: req.user.userId,
        src,
        filename: req.file.filename,
        type: req.file.mimetype.split('/')[1],
        mimetype: req.file.mimetype,
        size: req.file.size,
      });


      return res.status(StatusCodes.OK).json({
        message: 'Файлы успешно загружены',
        src,
        file: req.file,

      });
    })
  } catch (error) {
    return next(error);
  }
}
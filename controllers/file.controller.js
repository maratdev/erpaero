import multer from 'multer';
import crypto from 'crypto';
import { extname, join } from 'node:path';
import { format } from 'date-fns';
import pkg from 'app-root-path';
import { BadRequestError } from '../middlewares/errors/BadRequestError.js';
import { StatusCodes } from 'http-status-codes';
import fs from 'fs-extra';
import FilesUserModel from '../models/users/filesModel.js';
import config from '../config/app.js';
import { NotFoundError } from '../middlewares/errors/NotFoundError.js';
import { FILE } from '../middlewares/errors/error-texts.js';

const { path } = pkg;

const dateFolder = format(new Date(), 'yyyy/MM/dd');
const getUploadDirectoryPath = (folder) => {
	return join(`${path}/${config.PATH}/${folder}`, dateFolder);
};
const upload = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			const directory = getUploadDirectoryPath(req.user.userId);
			fs.mkdirpSync(directory, { recursive: true });
			cb(null, directory);
		},
		filename: (req, file, cb) => {
			const tempToken = crypto.randomUUID();
			cb(null, tempToken + extname(file.originalname));
		},
	}),
	limits: { fileSize: 1024 * 1024 * 10 }, // 10MB
	fileFilter: (req, file, cb) => {
		const extension =
			['.png', '.jpg', '.jpeg'].indexOf(extname(file.originalname).toLowerCase()) >= 0;
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
      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Файл не загружен',
        });
      }
			const src = `/${config.PATH}/${req.user.userId}/${dateFolder}/`;
			await FilesUserModel.create({
				user_id: req.user.userId,
        destination: src,
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
		});
	} catch (error) {
		return next(error);
	}
};

export const fileAllList = async (req, res, next) => {
	try {
		const { page, limit } = req.query;
		const filesDb = await FilesUserModel.findAll({
			where: {
				user_id: req.user.userId,
			},
			offset: Number(((page-1)*limit)) || 0,
			limit: Number(limit) || 10,
			order: [['createdAt', 'ASC']],
		});
		if (!filesDb) {
			return next(new NotFoundError(FILE.NOT_FOUND));
		}
		res.status(StatusCodes.OK).send(filesDb);
	} catch (error) {
		return next(error);
	}
};

export const fileDelete = async (req, res, next) => {
	try {
		const filesDb = await FilesUserModel.findOne({
			where: { user_id: req.user.userId, id: req.params.id },
		});
		if (!filesDb) {
			return next(new NotFoundError(FILE.NOT_FOUND));
		}
		if (filesDb) {
			await filesDb.destroy();
			fs.unlink(path + filesDb.destination + filesDb.filename, (err) => {
				if (err && err.code === 'ENOENT') return next(new NotFoundError(FILE.NOT_FOUND_DISK));
				return res.status(StatusCodes.OK).send({ message: 'file deleted successfully' });
			});
		}
	} catch (error) {
		return next(error);
	}
};

export const fileGetInfo = async (req, res, next) => {
	try {
		const filesDb = await FilesUserModel.findOne({
			where: { user_id: req.user.userId, id: req.params.id },
		});
		if (!filesDb) {
			return next(new NotFoundError(FILE.NOT_FOUND));
		}
		if (filesDb) {
			return res.status(StatusCodes.OK).send(filesDb);
		}
	} catch (error) {
		return next(error);
	}
};

export const fileUpdate = async (req, res, next) => {
  try {
    const { filename } = req.body;

    const filesDb = await FilesUserModel.findOne({
      where: { user_id: req.user.userId, id: req.params.id },
    });
    if (!filesDb) {
      return next(new NotFoundError(FILE.NOT_FOUND));
    }
    if (filesDb) {
      await fs.rename(join(path + filesDb.destination + filesDb.filename), join(path + filesDb.destination + filename) , (err) => {
        if (err && err.code === 'ENOENT') return next(new NotFoundError(FILE.NOT_FOUND_DISK));
        filesDb.update({ filename: filename });
        return res.status(StatusCodes.OK).send({ message: FILE.SUCCESS_UPDATE });
      });
    }
  } catch (error) {
    return next(error);
  }
};

export const fileDownload= async (req, res, next) => {
  try {
    const filesDb = await FilesUserModel.findOne({
      where: { user_id: req.user.userId, id: req.params.id },
    });
    if (!filesDb) {
      return next(new NotFoundError(FILE.NOT_FOUND));
    }
    if (filesDb) {
      const file = join(path + filesDb.destination + filesDb.filename);
      res.download(file);
    }
  } catch (error) {
    return next(error);
  }
};
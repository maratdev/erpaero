import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import process from 'node:process';
const {

  NODE_ENV, JWT_SECRET,
} = process.env;
// Создаёт пользователя
export const createUser = (req, res, next) => {
  req.body.password = bcrypt.hashSync(req.body.password, 7);
  const {
    email, password
  } = req.body;
  const newUser = new User({
    email, password,
  });
  newUser
    .save()
    .then((result) => {
      res.status(CREATED).send({
        email: result.email,
        name: result.name,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(invalidDataError));
      } else if (err.code === 11000) {
        next(new ConflictError(duplicateEmailError));
      } else {
        next(err);
      }
    });
};
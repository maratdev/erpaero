import { celebrate, Joi } from 'celebrate';

// ---------------------------------------- Users --------------------------- /
// регистрация
export const validationCreateUser = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

// аутенфикация
export const validationLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

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

// ---------------------------------------- File --------------------------- /

export const validationFileQuery= celebrate({
  query: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number(),
  }),
});

export const validationFileParams= celebrate({
  params: Joi.object({
    id: Joi.string().guid().required(),
  }),
  body: Joi.object().keys({
    filename: Joi.string().required(),
  }),
});
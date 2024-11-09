export const USER = {
  CREATED: 'User created',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN_ERROR: 'No access',
  EMAIL_NOT_FOUND: 'Email not found',
  EMAIL_DUPLICATION: 'Email already exists',
  EMAIL_CONFIRM: 'Your email address has been confirmed',
  CREATED_SUCCESS: 'User successfully created',
  LOGIN_EXIST: 'Email or password is incorrect',
  INVALID_PASSWORD: 'Invalid password',
  NOT_FOUND: 'User not found',
  SIGN_IN: 'Please sign in',
  LOGOUT: 'Exit user',
  LOGOUT_ALL: 'Exit all users'
};

export const FILE = {
  NOT_FOUND: 'File not found DB',
  NOT_FOUND_DISK: 'Disk not found',
  SUCCESS_UPDATE: 'File updated successfully'
};

export const TOKEN = {
  INVALID: 'Invalid token',
  INVALID_RT: 'Invalid refresh token',
  INVALID_BD: 'Refresh token is incorrect',
  INVALID_TIME: 'Access token expired',
  NOT_FOUND: 'Access token not found',
};

export const TOTP = {
  SUCCESS: 'TOTP validated successfully',
  INVALID: 'TOTP is not correct or expired',
  REQUIRED: 'TOTP is required',
  CONFIRM: 'Please fill in all fields (tempToken and totp)',
  EXIST: 'The provided temporary token is incorrect or expired',
};

export const SERVER = {
  ERROR: 'An error occurred on the server',
};

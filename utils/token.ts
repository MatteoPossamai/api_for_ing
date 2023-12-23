const jwt = require('jsonwebtoken');

export const generateToken = (secret: string, expiresIn: Number, payload: object) => {
  return jwt.sign(payload, secret, { expiresIn });
}

export const verifyToken = async (secret: string, token: string) => {
    let x = await jwt.verify(token, secret, (err: any, decoded: any) => {
      return decoded;
    });
    return x;
}


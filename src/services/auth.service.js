// services/auth.service.js
// KEYWORDS: AUTH_SERVICE / LOGIN / REGISTER / ACL / ROLEPERMISO / SAFE

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User, Role, RolePermiso, Modulo, Accion } = require("../models");
const { jwt: jwtConfig, bcrypt: bcryptConfig } = require("../config/security");

class AuthService {
  //  KEYWORDS: ACL / BUILD / ROLEPERMISO
  async getAclByRoleId(idroles) {
    const roleId = Number(idroles);

    //  admin => acceso total
    if (roleId === 1) return { __admin: true };

    //  trae módulos+acciones permitidas para el rol
    const rows = await RolePermiso.findAll({
      where: { idroles: roleId, permitido: 1 },
      include: [
        { model: Modulo, as: "modulo", attributes: ["codigo"] },
        { model: Accion, as: "accion", attributes: ["codigo"] },
      ],
    });

    //  ACL shape para PermissionGate:
    // { "metodospago": { "read": true, "create": true } }
    const acl = {};

    for (const rp of rows) {
      const modulo = rp?.modulo?.codigo;
      const accion = rp?.accion?.codigo;

      if (!modulo || !accion) continue;

      const modKey = String(modulo).trim().toLowerCase();
      const actKey = String(accion).trim().toLowerCase();

      if (!acl[modKey]) acl[modKey] = {};
      acl[modKey][actKey] = true;
    }

    return acl;
  }

  async register(userData) {
    const {
      numero_documento,
      tipo_documento,
      nombre,
      telefono,
      email,
      contrasena,
      idroles,
    } = userData;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error("El email ya está registrado");
      error.statusCode = 409;
      throw error;
    }

    const existingDoc = await User.findByPk(numero_documento);
    if (existingDoc) {
      const error = new Error("El número de documento ya está registrado");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(
      contrasena,
      bcryptConfig.saltRounds
    );

    const user = await User.create({
      numero_documento,
      tipo_documento,
      nombre,
      telefono,
      email,
      contrasena: hashedPassword,
      idroles: idroles || 2,
    });

    const role = await Role.findByPk(user.idroles);

    return {
      numero_documento: user.numero_documento,
      nombre: user.nombre,
      email: user.email,
      rol: role ? role.nombrerol : null,
    };
  }

  async login(email, contrasena) {
    // KEYWORDS: normalize input
    const e = String(email || "").trim();
    const p = String(contrasena || "").trim();

    const user = await User.findOne({ where: { email: e } });

    if (!user) {
      const error = new Error("Credenciales inválidas");
      error.statusCode = 401;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(p, user.contrasena);
    if (!isValidPassword) {
      const error = new Error("Credenciales inválidas");
      error.statusCode = 401;
      throw error;
    }

    let role = null;
    try {
      role = await Role.findByPk(user.idroles);
    } catch (error) {
      console.log("Error fetching role:", error.message);
    }

    // ✅ KEYWORDS: TOKEN_PAYLOAD
    const tokenPayload = {
      numero_documento: user.numero_documento,
      email: user.email,
      nombre: user.nombre,
      idroles: user.idroles,
      nombrerol: role ? role.descripcion : null,
    };

    const accessToken = jwt.sign(tokenPayload, jwtConfig.accessSecret, {
      expiresIn: jwtConfig.accessTTL,
    });

    const refreshToken = jwt.sign(
      { numero_documento: user.numero_documento },
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshTTL }
    );

    // ✅ KEYWORDS: ACL in login response
    const acl = await this.getAclByRoleId(user.idroles);

    return {
      accessToken,
      refreshToken,
      expiresIn: jwtConfig.accessTTL,
      user: {
        numero_documento: user.numero_documento,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        tipo_documento: user.tipo_documento,
        idroles: user.idroles,
        rol: role ? role.descripcion : null,
      },
      acl,
    };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);

      const user = await User.findByPk(decoded.numero_documento);
      if (!user) {
        const error = new Error("Usuario no encontrado");
        error.statusCode = 401;
        throw error;
      }

      const role = await Role.findByPk(user.idroles);

      const tokenPayload = {
        numero_documento: user.numero_documento,
        email: user.email,
        nombre: user.nombre,
        idroles: user.idroles,
        nombrerol: role ? role.descripcion : null,
      };

      const newAccessToken = jwt.sign(tokenPayload, jwtConfig.accessSecret, {
        expiresIn: jwtConfig.accessTTL,
      });

      const newRefreshToken = jwt.sign(
        { numero_documento: user.numero_documento },
        jwtConfig.refreshSecret,
        { expiresIn: jwtConfig.refreshTTL }
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: jwtConfig.accessTTL,
      };
    } catch (error) {
      const err = new Error("Token de refresh inválido");
      err.statusCode = 401;
      throw err;
    }
  }

  async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return {
        message:
          "Si el email existe, recibirás instrucciones para restablecer tu contraseña",
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 3600000);

    await user.update({
      reset_token: resetToken,
      token_expires: tokenExpires,
    });

    return {
      message:
        "Si el email existe, recibirás instrucciones para restablecer tu contraseña",
      resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
    };
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({ where: { reset_token: token } });

    if (!user) {
      const error = new Error("Token inválido o expirado");
      error.statusCode = 400;
      throw error;
    }

    if (user.token_expires && new Date(user.token_expires) < new Date()) {
      const error = new Error("Token expirado");
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      bcryptConfig.saltRounds
    );

    await user.update({
      contrasena: hashedPassword,
      reset_token: null,
      token_expires: null,
    });

    return { message: "Contraseña actualizada exitosamente" };
  }
}

module.exports = new AuthService();
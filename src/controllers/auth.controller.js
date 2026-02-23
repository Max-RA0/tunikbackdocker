// controllers/auth.controller.js
// KEYWORDS: AUTH_CONTROLLER / LOGIN / REGISTER / ACL / REFRESH / SAFE

const authService = require("../services/auth.service");
const response = require("../utils/response.util");

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return response.created(res, result, "Usuario registrado exitosamente");
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, contrasena } = req.body;
      const result = await authService.login(email, contrasena);
      return response.success(res, result, "Login exitoso");
    } catch (error) {
      next(error);
    }
  }

  // KEYWORDS: ACL / ME / ROLE_PERMISSIONS
  async acl(req, res, next) {
    try {
      const idroles = req.user?.idroles;
      if (!idroles) return response.unauthorized(res, "No autenticado");

      const acl = await authService.getAclByRoleId(idroles);

      // ✅ mantenemos la forma: data: { acl }
      return response.success(res, { acl }, "ACL obtenido");
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      return response.success(res, result, "Token renovado");
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      return response.success(res, null, "Sesión cerrada exitosamente");
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      return response.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      return response.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
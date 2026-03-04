// controllers/profile.controller.js
const usersService = require("../services/users.service");
const response = require("../utils/response.util");
// KEYWORDS: extract numero documento from token
function getDocumentoFromToken(reqUser) {
  return (
    reqUser?.numero_documento ||
    reqUser?.numeroDocumento ||
    reqUser?.documento ||
    reqUser?.cedula ||
    reqUser?.cc ||
    reqUser?.identificacion ||
    null
  );
}
class ProfileController {
  // GET /api/profile/me
  async me(req, res, next) {
    try {
      const numero_documento = getDocumentoFromToken(req.user);
      if (!numero_documento) {
        return response.unauthorized(res, "Token inválido (sin documento)");
      }
      const user = await usersService.findByDocumento(numero_documento);
      return response.success(res, user, "Perfil obtenido");
    } catch (error) {
      next(error);
    }
  }
  // PUT /api/profile/me
  async updateMe(req, res, next) {
    try {
      const numero_documento = getDocumentoFromToken(req.user);
      if (!numero_documento) {
        return response.unauthorized(res, "Token inválido (sin documento)");
      }
      // KEYWORDS: allow only safe fields from client
      const payload = {
        nombre: req.body?.nombre,
        telefono: req.body?.telefono,
        email: req.body?.email,
      };
      // KEYWORDS: SELF_ONLY_UPDATE (no params id)
      const user = await usersService.update(numero_documento, payload);
      return response.success(res, user, "Perfil actualizado exitosamente");
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new ProfileController();
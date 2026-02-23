// controllers/permisos.controller.js
// KEYWORDS: PERMISOS_CONTROLLER / MODULOS / ACCIONES / ROLEPERMISO / REPLACE_ALL / SAFE

const response = require("../utils/response.util");
const { Role, RolePermiso, Modulo, Accion } = require("../models");

class PermisosController {
  // GET /api/permisos/modulos
  async findAllModulos(req, res, next) {
    try {
      const rows = await Modulo.findAll({
        order: [["idmodulo", "ASC"]],
      });
      return response.success(res, rows, "Módulos obtenidos");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/permisos/acciones
  async findAllAcciones(req, res, next) {
    try {
      const rows = await Accion.findAll({
        order: [["idaccion", "ASC"]],
      });
      return response.success(res, rows, "Acciones obtenidas");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/permisos/roles/:idroles
  async getPermisosByRole(req, res, next) {
    try {
      const idroles = Number(req.params.idroles);

      if (!Number.isFinite(idroles)) {
        return response.badRequest(res, "idroles inválido");
      }

      const role = await Role.findByPk(idroles);
      if (!role) return response.notFound(res, "Rol no encontrado");

      const rows = await RolePermiso.findAll({
        where: { idroles },
        include: [
          { model: Modulo, as: "modulo", attributes: ["idmodulo", "nombre", "codigo"] },
          { model: Accion, as: "accion", attributes: ["idaccion", "nombre", "codigo"] },
        ],
        order: [
          [{ model: Modulo, as: "modulo" }, "idmodulo", "ASC"],
          [{ model: Accion, as: "accion" }, "idaccion", "ASC"],
        ],
      });

      return response.success(res, rows, "Permisos del rol obtenidos");
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/permisos/roles/:idroles  body: { permisos: [{idmodulo,idaccion,permitido}] }
  async assignPermisosToRole(req, res, next) {
    try {
      const idroles = Number(req.params.idroles);
      const permisos = Array.isArray(req.body?.permisos) ? req.body.permisos : [];

      if (!Number.isFinite(idroles)) {
        return response.badRequest(res, "idroles inválido");
      }

      const role = await Role.findByPk(idroles);
      if (!role) return response.notFound(res, "Rol no encontrado");

      // KEYWORDS: REPLACE_ALL
      await RolePermiso.destroy({ where: { idroles } });

      // crear solo los permitidos
      const createRows = permisos
        .filter((p) => Number(p?.permitido) === 1)
        .map((p) => ({
          idroles,
          idmodulo: Number(p.idmodulo),
          idaccion: Number(p.idaccion),
          permitido: 1,
        }))
        .filter(
          (p) =>
            Number.isFinite(p.idmodulo) &&
            Number.isFinite(p.idaccion) &&
            p.idmodulo > 0 &&
            p.idaccion > 0
        );

      if (createRows.length > 0) {
        await RolePermiso.bulkCreate(createRows);
      }

      return response.success(res, { ok: true, count: createRows.length }, "Permisos asignados");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/permisos/roles/:idroles  body: { idmodulo, idaccion }
  async addPermisoToRole(req, res, next) {
    try {
      const idroles = Number(req.params.idroles);
      const idmodulo = Number(req.body?.idmodulo);
      const idaccion = Number(req.body?.idaccion);

      if (!Number.isFinite(idroles) || !Number.isFinite(idmodulo) || !Number.isFinite(idaccion)) {
        return response.badRequest(res, "Datos inválidos");
      }

      const role = await Role.findByPk(idroles);
      if (!role) return response.notFound(res, "Rol no encontrado");

      const exists = await RolePermiso.findOne({ where: { idroles, idmodulo, idaccion } });
      if (exists) {
        // si existe lo marcamos permitido = 1
        await exists.update({ permitido: 1 });
        return response.success(res, exists, "Permiso actualizado");
      }

      const created = await RolePermiso.create({ idroles, idmodulo, idaccion, permitido: 1 });
      return response.created(res, created, "Permiso agregado");
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/permisos/roles/:idroles/:idmodulo/:idaccion
  async removePermisoFromRole(req, res, next) {
    try {
      const idroles = Number(req.params.idroles);
      const idmodulo = Number(req.params.idmodulo);
      const idaccion = Number(req.params.idaccion);

      if (!Number.isFinite(idroles) || !Number.isFinite(idmodulo) || !Number.isFinite(idaccion)) {
        return response.badRequest(res, "Parámetros inválidos");
      }

      const deleted = await RolePermiso.destroy({ where: { idroles, idmodulo, idaccion } });

      return response.success(res, { ok: true, deleted }, "Permiso eliminado");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PermisosController();
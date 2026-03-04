const { Role, RolePermiso, Modulo, Accion } = require('../models');
const response = require('../utils/response.util');

class PermisosController {
  // Listar todos los módulos disponibles
  async findAllModulos(req, res, next) {
    try {
      const modulos = await Modulo.findAll({
        where: { activo: 1 },
        order: [['nombre', 'ASC']]
      });
      return response.success(res, modulos);
    } catch (error) {
      next(error);
    }
  }

  // Listar todas las acciones disponibles
  async findAllAcciones(req, res, next) {
    try {
      const acciones = await Accion.findAll({
        order: [['idaccion', 'ASC']]
      });
      return response.success(res, acciones);
    } catch (error) {
      next(error);
    }
  }

  // Obtener permisos de un rol (qué módulos y acciones tiene permitidos)
  async getPermisosByRole(req, res, next) {
    try {
      const { idroles } = req.params;
      const role = await Role.findByPk(idroles);

      if (!role) {
        return response.notFound(res, 'Rol no encontrado');
      }

      const permisos = await RolePermiso.findAll({
        where: { idroles, permitido: 1 },
        include: [
          { model: Modulo, as: 'modulo', attributes: ['idmodulo', 'codigo', 'nombre'] },
          { model: Accion, as: 'accion', attributes: ['idaccion', 'codigo', 'nombre'] }
        ]
      });

      return response.success(res, permisos);
    } catch (error) {
      next(error);
    }
  }

  // Asignar permisos a un rol
  // Body: { permisos: [{ idmodulo, idaccion, permitido }] }
  async assignPermisosToRole(req, res, next) {
    try {
      const { idroles } = req.params;
      const { permisos } = req.body;

      const role = await Role.findByPk(idroles);
      if (!role) {
        return response.notFound(res, 'Rol no encontrado');
      }

      // Eliminar permisos existentes del rol
      await RolePermiso.destroy({ where: { idroles } });

      // Crear nuevos permisos
      if (permisos && Array.isArray(permisos)) {
        for (const p of permisos) {
          await RolePermiso.create({
            idroles,
            idmodulo: p.idmodulo,
            idaccion: p.idaccion,
            permitido: p.permitido !== undefined ? p.permitido : 1
          });
        }
      }

      // Obtener permisos actualizados
      const permisosActualizados = await RolePermiso.findAll({
        where: { idroles },
        include: [
          { model: Modulo, as: 'modulo', attributes: ['idmodulo', 'codigo', 'nombre'] },
          { model: Accion, as: 'accion', attributes: ['idaccion', 'codigo', 'nombre'] }
        ]
      });

      return response.success(res, permisosActualizados, 'Permisos asignados exitosamente');
    } catch (error) {
      next(error);
    }
  }

  // Agregar un permiso específico a un rol
  async addPermisoToRole(req, res, next) {
    try {
      const { idroles } = req.params;
      const { idmodulo, idaccion } = req.body;

      const role = await Role.findByPk(idroles);
      if (!role) {
        return response.notFound(res, 'Rol no encontrado');
      }

      // Verificar si ya existe
      const existing = await RolePermiso.findOne({
        where: { idroles, idmodulo, idaccion }
      });

      if (existing) {
        await existing.update({ permitido: 1 });
        return response.success(res, existing, 'Permiso actualizado');
      }

      const nuevoPermiso = await RolePermiso.create({
        idroles,
        idmodulo,
        idaccion,
        permitido: 1
      });

      return response.created(res, nuevoPermiso, 'Permiso agregado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  // Eliminar un permiso específico de un rol
  async removePermisoFromRole(req, res, next) {
    try {
      const { idroles, idmodulo, idaccion } = req.params;

      const permiso = await RolePermiso.findOne({
        where: { idroles, idmodulo, idaccion }
      });

      if (!permiso) {
        return response.notFound(res, 'Permiso no encontrado');
      }

      await permiso.destroy();
      return response.success(res, null, 'Permiso eliminado exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PermisosController();

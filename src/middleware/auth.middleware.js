const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/security');
const response = require('../utils/response.util');
const { Role, RolePermiso, Modulo, Accion } = require('../models');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.unauthorized(res, 'Token no proporcionado');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.accessSecret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return response.unauthorized(res, 'Token expirado');
    }
    return response.unauthorized(res, 'Token inválido');
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return response.unauthorized(res, 'No autenticado');
    }

    const userRole = req.user.role || req.user.nombrerol;
    const normalizedUserRole = String(userRole || '').toLowerCase();
    const normalizedRoles = roles.map(r => String(r || '').toLowerCase());

    if (!normalizedRoles.includes(normalizedUserRole)) {
      return response.forbidden(res, 'No tiene permisos para esta acción');
    }

    next();
  };
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.accessSecret);
    req.user = decoded;
  } catch (error) {
    // Token inválido, continuar sin usuario
  }

  next();
};

const requirePermission = (permissionCode) => {
  return async (req, res, next) => {
    if (!req.user) {
      return response.unauthorized(res, 'No autenticado');
    }

    try {
      // permissionCode format: "modulo.accion" (e.g., "roles.read", "usuarios.create")
      const [moduloCodigo, accionCodigo] = permissionCode.split('.');
      
      if (!moduloCodigo || !accionCodigo) {
        console.error('Invalid permission code format:', permissionCode);
        return response.forbidden(res, 'Código de permiso inválido');
      }

      // Find the module
      const modulo = await Modulo.findOne({ where: { codigo: moduloCodigo } });
      if (!modulo) {
        return response.forbidden(res, 'Módulo no encontrado');
      }

      // Find the action
      const accion = await Accion.findOne({ where: { codigo: accionCodigo } });
      if (!accion) {
        return response.forbidden(res, 'Acción no encontrada');
      }

      // Check if the role has permission for this module+action
      const rolePermiso = await RolePermiso.findOne({
        where: {
          idroles: req.user.idroles,
          idmodulo: modulo.idmodulo,
          idaccion: accion.idaccion,
          permitido: 1
        }
      });

      if (!rolePermiso) {
        return response.forbidden(res, 'No tiene permisos para esta acción');
      }

      next();
    } catch (error) {
      console.error('Error checking permission:', error);
      return response.error(res, 'Error al verificar permisos', 500);
    }
  };
};

module.exports = {
  verifyToken,
  requireRole,
  optionalAuth,
  requirePermission
};

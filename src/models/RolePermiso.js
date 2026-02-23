const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const RolePermiso = sequelize.define('RolePermiso', {
  idrol_permiso: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idroles: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'idroles'
    }
  },
  idmodulo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'modulos',
      key: 'idmodulo'
    }
  },
  idaccion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'acciones',
      key: 'idaccion'
    }
  },
  permitido: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'rolespermisos',
  timestamps: false
});

module.exports = RolePermiso;


// TABLA CONECTION DONDE SE UNE ROLES,MODULO(PRIVILEGIOS),ACCION(PERMISOS)
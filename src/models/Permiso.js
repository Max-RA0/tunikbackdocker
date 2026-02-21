const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Permiso = sequelize.define('Permiso', {
  idpermisos: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Código único del permiso, ej: inventory.productos.read'
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Descripción legible del permiso'
  }
}, {
  tableName: 'permisos',
  timestamps: false,
  underscored: false
});

module.exports = Permiso;

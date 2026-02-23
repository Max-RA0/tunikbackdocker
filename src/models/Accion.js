const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Accion = sequelize.define('Accion', {
  idaccion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'acciones',
  timestamps: false
});

module.exports = Accion;


//PERMISOS
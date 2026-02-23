const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const Modulo = sequelize.define('Modulo', {
  idmodulo: {
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
  },
  activo: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'modulos',
  timestamps: false
});

module.exports = Modulo;


//PRIVILEGIOS
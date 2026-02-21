const { EvaluacionServicio, User, Servicio } = require('../models');
const { Op } = require('sequelize');

class RatingsService {
  async findAll(query = {}) {
    const { idservicios, numero_documento } = query;
    const where = {};

    if (idservicios) {
      where.idservicios = idservicios;
    }

    if (numero_documento) {
      where.numero_documento = numero_documento;
    }

    return await EvaluacionServicio.findAll({
      where,
      include: [
        { model: User, as: 'usuario', attributes: ['numero_documento', 'nombre', 'email'] },
        { model: Servicio, as: 'servicio' }
      ]
    });
  }

  async findById(idevaluacion) {
    const evaluacion = await EvaluacionServicio.findByPk(idevaluacion, {
      include: [
        { model: User, as: 'usuario', attributes: ['numero_documento', 'nombre', 'email'] },
        { model: Servicio, as: 'servicio' }
      ]
    });

    if (!evaluacion) {
      const error = new Error('Evaluación no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return evaluacion;
  }

  async create(data) {
    const { numero_documento, idservicios, respuestacalificacion, comentarios } = data;

    const evaluacion = await EvaluacionServicio.create({
      numero_documento,
      idservicios,
      respuestacalificacion,
      comentarios
    });

    return await this.findById(evaluacion.idevaluacion);
  }

  async update(idevaluacion, data) {
    const evaluacion = await EvaluacionServicio.findByPk(idevaluacion);
    if (!evaluacion) {
      const error = new Error('Evaluación no encontrada');
      error.statusCode = 404;
      throw error;
    }

    await evaluacion.update(data);
    return await this.findById(idevaluacion);
  }

  async delete(idevaluacion) {
    const evaluacion = await EvaluacionServicio.findByPk(idevaluacion);
    if (!evaluacion) {
      const error = new Error('Evaluación no encontrada');
      error.statusCode = 404;
      throw error;
    }
    await evaluacion.destroy();
    return { message: 'Evaluación eliminada exitosamente' };
  }

  async getSummary(query = {}) {
    const evaluaciones = await EvaluacionServicio.findAll();

    if (evaluaciones.length === 0) {
      return {
        total: 0,
        calificaciones: {}
      };
    }

    const total = evaluaciones.length;
    const calificaciones = {};
    
    evaluaciones.forEach(e => {
      const cal = e.respuestacalificacion || 'Sin calificación';
      calificaciones[cal] = (calificaciones[cal] || 0) + 1;
    });

    return {
      total,
      calificaciones
    };
  }
}

module.exports = new RatingsService();

// src/services/appointments.service.js
// KEYWORDS: APPOINTMENTS_SERVICE / MULTI_VEHICLES / DETALLES_WITH_PLACA / LEGACY_COMPAT
// KEYWORDS: TRANSACTION / BULK_CREATE / KEEP_INCLUDES / SAFE_FILTERS

const { AgendaCita, DetalleAgendaCita, Vehiculo, Servicio, TipoVehiculo, Marca, User } = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../database/connection");

class AppointmentsService {
  // Agenda de citas
  async findAll(query = {}) {
    const { from, to, estado, placa } = query;
    const where = {};

    if (from && to) {
      where.fecha = {
        [Op.between]: [new Date(from), new Date(to)],
      };
    } else if (from) {
      where.fecha = { [Op.gte]: new Date(from) };
    } else if (to) {
      where.fecha = { [Op.lte]: new Date(to) };
    }

    if (estado) {
      where.estado = estado;
    }

    // KEYWORDS: FILTER_PLACA_ON_HEADER (legacy)
    // Si agendacitas.placa es null, este filtro solo sirve para citas legacy.
    // Para filtrar por placa real (detalles), se requiere query distinto.
    if (placa) {
      where.placa = placa;
    }

    return await AgendaCita.findAll({
      where,
      include: [
        {
          model: Vehiculo,
          as: "vehiculo",
          include: [
            { model: TipoVehiculo, as: "tipo" },
            { model: Marca, as: "marca" },
            { model: User, as: "usuario", attributes: ["numero_documento", "nombre", "email", "telefono"] },
          ],
        },
        {
          model: DetalleAgendaCita,
          as: "detalles",
          include: [{ model: Servicio, as: "servicio" }],
        },
      ],
      order: [["fecha", "DESC"]],
    });
  }

  async findById(idagendacitas) {
    const cita = await AgendaCita.findByPk(idagendacitas, {
      include: [
        {
          model: Vehiculo,
          as: "vehiculo",
          include: [
            { model: TipoVehiculo, as: "tipo" },
            { model: Marca, as: "marca" },
            { model: User, as: "usuario", attributes: ["numero_documento", "nombre", "email", "telefono"] },
          ],
        },
        {
          model: DetalleAgendaCita,
          as: "detalles",
          include: [{ model: Servicio, as: "servicio" }],
        },
      ],
    });

    if (!cita) {
      const error = new Error("Cita no encontrada");
      error.statusCode = 404;
      throw error;
    }

    return cita;
  }

  /**
   * create(data)
   * Soporta:
   * 1) Legacy (1 vehiculo): { placa, fecha, estado? }
   * 2) Multi-vehiculos (1 cita, N detalles): {
   *      fecha, estado?,
   *      detalles: [{ placa, idservicios, precio_unitario, cantidad?, descripcionvehiculo? }, ...]
   *    }
   */
  async create(data) {
    const { placa, fecha, estado, detalles } = data;

    const hasDetalles = Array.isArray(detalles) && detalles.length > 0;

    const transaction = await sequelize.transaction();

    try {
      // KEYWORDS: HEADER_PLACA_NULL_WHEN_MULTI
      const cita = await AgendaCita.create(
        {
          // En modo multi, la placa de cabecera no se usa (puede ir null)
          placa: hasDetalles ? null : placa,
          fecha,
          estado: estado || "Pendiente",
        },
        { transaction }
      );

      if (hasDetalles) {
        // KEYWORDS: DETALLES_REQUIRE_PLACA_PER_ITEM
        const detallesData = detalles.map((d) => ({
          idagendacitas: cita.idagendacitas,
          idservicios: d.idservicios,
          cantidad: d.cantidad || 1,
          precio_unitario: d.precio_unitario,

          // Campos extra del modelo DetalleAgendaCita
          placa: d.placa || null,
          descripcionvehiculo: d.descripcionvehiculo || null,
        }));

        await DetalleAgendaCita.bulkCreate(detallesData, { transaction });
      }

      await transaction.commit();
      return await this.findById(cita.idagendacitas);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async update(idagendacitas, data) {
    const cita = await AgendaCita.findByPk(idagendacitas);
    if (!cita) {
      const error = new Error("Cita no encontrada");
      error.statusCode = 404;
      throw error;
    }

    await cita.update(data);
    return await this.findById(idagendacitas);
  }

  async delete(idagendacitas) {
    const cita = await AgendaCita.findByPk(idagendacitas);
    if (!cita) {
      const error = new Error("Cita no encontrada");
      error.statusCode = 404;
      throw error;
    }
    await cita.destroy();
    return { message: "Cita eliminada exitosamente" };
  }

  // Detalles de agenda
  async findAllDetalles() {
    return await DetalleAgendaCita.findAll({
      include: [
        { model: AgendaCita, as: "agendaCita" },
        { model: Servicio, as: "servicio" },
      ],
    });
  }

  async findDetallesByAgenda(idagendacitas) {
    return await DetalleAgendaCita.findAll({
      where: { idagendacitas },
      include: [{ model: Servicio, as: "servicio" }],
    });
  }

  async getTotalByAgenda(idagendacitas) {
    const detalles = await DetalleAgendaCita.findAll({
      where: { idagendacitas },
    });

    const total = detalles.reduce((sum, d) => {
      return sum + parseFloat(d.precio_unitario) * d.cantidad;
    }, 0);

    return { idagendacitas, total };
  }

  async createDetalle(data) {
    const detalle = await DetalleAgendaCita.create(data);
    return await DetalleAgendaCita.findByPk(detalle.iddetalleagenda, {
      include: [{ model: Servicio, as: "servicio" }],
    });
  }

  async updateDetalle(idagendacitas, idservicios, data) {
    const detalle = await DetalleAgendaCita.findOne({
      where: { idagendacitas, idservicios },
    });

    if (!detalle) {
      const error = new Error("Detalle no encontrado");
      error.statusCode = 404;
      throw error;
    }

    await detalle.update(data);
    return detalle;
  }

  async deleteDetalle(idagendacitas, idservicios) {
    const detalle = await DetalleAgendaCita.findOne({
      where: { idagendacitas, idservicios },
    });

    if (!detalle) {
      const error = new Error("Detalle no encontrado");
      error.statusCode = 404;
      throw error;
    }

    await detalle.destroy();
    return { message: "Detalle eliminado exitosamente" };
  }
}

module.exports = new AppointmentsService();
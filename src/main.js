require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./database/connection');
const logger = require('./utils/logger.util');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function bootstrap() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    app.listen(PORT, HOST, () => {
      logger.info(`Server running on http://${HOST}:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
}

bootstrap();

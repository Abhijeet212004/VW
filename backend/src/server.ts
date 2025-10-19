import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './modules/auth/auth.route';
import vehicleRoutes from './modules/vehicle/vehicle.route';
import parkingSpotRoutes from './modules/parkingSpot/parkingSpot.route';
import slotDetailsRoutes from './modules/slot_details/slot_details.route';
import { errorHandler } from './middlewares/error.middleware';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Parking API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Parking API Documentation',
}));

app.use('/api/auth', authRoutes);
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/parking-spot', parkingSpotRoutes);
app.use('/api/slot-details', slotDetailsRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

export default app;

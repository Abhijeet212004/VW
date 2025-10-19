import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Parking App API',
      version: '1.0.0',
      description: 'Smart Parking Management System with Vehicle Verification',
      contact: {
        name: 'API Support',
        email: 'support@parkingapp.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Clerk JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '71324c7a-5c58-434d-be78-7c0b6a55c49c',
            },
            clerkId: {
              type: 'string',
              example: 'user_2abc123def',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            phone: {
              type: 'string',
              example: '+919876543210',
            },
            profilePhoto: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/photo.jpg',
            },
            verificationStatus: {
              type: 'string',
              enum: ['PENDING', 'AUTO_VERIFIED', 'MANUAL_REVIEW', 'VERIFIED', 'REJECTED'],
              example: 'PENDING',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'User authentication and profile management',
      },
      {
        name: 'Vehicle',
        description: 'Vehicle verification and management',
      },
    ],
  },
  apis: ['./src/modules/**/*.route.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

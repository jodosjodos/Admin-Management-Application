import "reflect-metadata";
import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";
import { initializeDatabase } from "./config/database";
import {
  apiLimiter,
  authLimiter,
  criticalLimiter,
} from "./middleware/rate-limit.middleware";

// Load environment variables
dotenv.config();

// Import routes
import { AuthController } from "./modules/auth/auth.controller";
import usersRoutes from "./modules/users/users.controller";
import transactionsRoutes from "./modules/transactions/transactions.controller";
import dashboardRoutes from "./modules/dashboard/dashboard.controller";

// Import middleware
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 5001;

// Security Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5172",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Apply rate limiting
app.use("/api", apiLimiter); // General API rate limit

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Credit Jambo Admin API",
      version: "1.0.0",
      description: "API documentation for Credit Jambo Admin Application",
      contact: {
        name: "Credit Jambo Ltd",
        email: "hello@creditjambo.com",
        url: "www.creditjambo.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/modules/**/*.ts"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health check (no rate limit)
app.get("/", (_req, res) => {
  res.json({
    message: "Credit Jambo Admin API",
    status: "running",
    version: "1.0.0",
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Apply routes with specific rate limiters
const authController = new AuthController();
app.use("/api/auth", authLimiter, authController.router); // Strict limit for admin auth
app.use("/api/users", criticalLimiter, usersRoutes); // Limit user management operations
app.use("/api/transactions", transactionsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Connect to database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Admin Server running on port ${PORT}`);
      console.log(
        `📚 API Documentation available at http://localhost:${PORT}/api-docs`
      );
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });

export default app;

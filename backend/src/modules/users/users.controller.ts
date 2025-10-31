import { Router, Response } from "express";
import { param, body, validationResult } from "express-validator";
import {
  authenticate,
  authorize,
  AuthRequest,
} from "../../middleware/auth.middleware";

const router = Router();

// For now, we'll create a simple interface to represent client users
// In production, this would connect to the client database or use a shared service

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all client users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    // TODO: Implement connection to client database or API
    // For now, return mock data
    const users = [
      {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phoneNumber: "+250788123456",
        role: "customer",
        isActive: true,
        createdAt: new Date(),
      },
    ];

    res.status(200).json({
      users,
      total: users.length,
      message: "Users retrieved successfully",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  [authenticate, param("id").isUUID()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // TODO: Fetch from client database
      const user = {
        id: req.params.id,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phoneNumber: "+250788123456",
        role: "customer",
        isActive: true,
        devices: [],
        createdAt: new Date(),
      };

      return res.status(200).json({ user });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/users/{id}/activate:
 *   put:
 *     summary: Activate/Deactivate user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id/activate",
  [
    authenticate,
    authorize("SUPER_ADMIN", "ADMIN"),
    param("id").isUUID(),
    body("isActive").isBoolean(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { isActive } = req.body;

      // TODO: Update in client database
      return res.status(200).json({
        message: `User ${isActive ? "activated" : "deactivated"} successfully`,
        user: { id, isActive },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/users/{id}/devices/{deviceId}/approve:
 *   put:
 *     summary: Approve or reject device
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isApproved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Device approval status updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User or device not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id/devices/:deviceId/approve",
  [
    authenticate,
    authorize("SUPER_ADMIN", "ADMIN"),
    param("id").isUUID(),
    param("deviceId").isString(),
    body("isApproved").isBoolean(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id, deviceId } = req.params;
      const { isApproved } = req.body;

      // TODO: Update in client database
      return res.status(200).json({
        message: `Device ${isApproved ? "approved" : "rejected"} successfully`,
        userId: id,
        deviceId,
        isApproved,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

export default router;

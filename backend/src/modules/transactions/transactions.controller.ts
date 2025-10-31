import { Router, Response } from "express";
import { query, param, validationResult } from "express-validator";
import {
  authenticate,
  authorize,
  AuthRequest,
} from "../../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions across the platform
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [DEPOSIT, WITHDRAWAL, CREDIT_DISBURSEMENT, CREDIT_REPAYMENT]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of transactions
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  [
    authenticate,
    authorize("SUPER_ADMIN", "ADMIN", "SUPPORT"),
    query("type").optional().isString(),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, startDate, endDate, page = 1, limit = 20 } = req.query;

      // TODO: Query client database for transactions
      // For now, return mock data
      const transactions = [
        {
          id: "1",
          userId: "user-1",
          type: "DEPOSIT",
          amount: 50000,
          currency: "RWF",
          status: "COMPLETED",
          createdAt: new Date(),
          user: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
          },
        },
        {
          id: "2",
          userId: "user-2",
          type: "WITHDRAWAL",
          amount: 20000,
          currency: "RWF",
          status: "COMPLETED",
          createdAt: new Date(),
          user: {
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@example.com",
          },
        },
      ];

      return res.status(200).json({
        transactions,
        total: transactions.length,
        page: Number(page),
        limit: Number(limit),
        filters: { type, startDate, endDate },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get transaction details
 *     tags: [Transactions]
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
 *         description: Transaction details
 *       404:
 *         description: Transaction not found
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
      const transaction = {
        id: req.params.id,
        userId: "user-1",
        type: "DEPOSIT",
        amount: 50000,
        currency: "RWF",
        status: "COMPLETED",
        metadata: {
          source: "Mobile Money",
          reference: "MM123456",
        },
        createdAt: new Date(),
        user: {
          id: "user-1",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phoneNumber: "+250788123456",
        },
      };

      return res.status(200).json({ transaction });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/transactions/user/{userId}:
 *   get:
 *     summary: Get transactions for a specific user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: User transactions
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get(
  "/user/:userId",
  [
    authenticate,
    authorize("SUPER_ADMIN", "ADMIN", "SUPPORT"),
    param("userId").isUUID(),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // TODO: Fetch user's transactions from client database
      const transactions = [
        {
          id: "1",
          userId,
          type: "DEPOSIT",
          amount: 50000,
          currency: "RWF",
          status: "COMPLETED",
          createdAt: new Date(),
        },
      ];

      return res.status(200).json({
        transactions,
        total: transactions.length,
        page: Number(page),
        limit: Number(limit),
        userId,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

export default router;

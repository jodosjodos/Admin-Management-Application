import { Router, Response } from "express";
import { query, validationResult } from "express-validator";
import {
  authenticate,
  authorize,
  AuthRequest,
} from "../../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get platform statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/stats",
  [authenticate, authorize("SUPER_ADMIN", "ADMIN")],
  async (_req: AuthRequest, res: Response) => {
    try {
      // TODO: Query client database for real statistics
      const stats = {
        users: {
          total: 1250,
          active: 987,
          inactive: 263,
          newThisMonth: 45,
        },
        savings: {
          totalAccounts: 1100,
          totalBalance: 125000000, // RWF
          totalDeposits: 95000000,
          totalWithdrawals: 25000000,
        },
        credit: {
          totalRequests: 450,
          approved: 320,
          rejected: 80,
          pending: 50,
          totalDisbursed: 85000000, // RWF
          totalRepaid: 45000000,
          outstandingBalance: 40000000,
        },
        transactions: {
          total: 5420,
          thisMonth: 234,
          volume: 210000000, // RWF
        },
        growth: {
          usersGrowth: 12.5, // percentage
          savingsGrowth: 18.3,
          creditGrowth: 22.7,
        },
      };

      return res.status(200).json({ stats });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/dashboard/credit-requests:
 *   get:
 *     summary: Get pending credit requests for approval
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, DISBURSED]
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
 *         description: List of credit requests
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/credit-requests",
  [
    authenticate,
    authorize("SUPER_ADMIN", "ADMIN"),
    query("status").optional().isString(),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status = "PENDING", page = 1, limit = 20 } = req.query;

      // TODO: Query client database for credit requests
      const creditRequests = [
        {
          id: "1",
          userId: "user-1",
          amount: 100000,
          currency: "RWF",
          status: "PENDING",
          creditScore: 720,
          repaymentPeriod: 30,
          purpose: "Business expansion",
          createdAt: new Date(),
          user: {
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            phoneNumber: "+250788123456",
          },
        },
        {
          id: "2",
          userId: "user-2",
          amount: 50000,
          currency: "RWF",
          status: "PENDING",
          creditScore: 680,
          repaymentPeriod: 15,
          purpose: "Emergency",
          createdAt: new Date(),
          user: {
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@example.com",
            phoneNumber: "+250788654321",
          },
        },
      ];

      return res.status(200).json({
        creditRequests,
        total: creditRequests.length,
        page: Number(page),
        limit: Number(limit),
        status,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get recent platform activity
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Recent activity
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/recent-activity",
  [
    authenticate,
    authorize("SUPER_ADMIN", "ADMIN", "SUPPORT"),
    query("limit").optional().isInt({ min: 1, max: 50 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { limit = 10 } = req.query;

      // TODO: Query client database for recent activity
      const activities = [
        {
          id: "1",
          type: "USER_REGISTRATION",
          description: "New user registered",
          userId: "user-1",
          userName: "John Doe",
          timestamp: new Date(),
        },
        {
          id: "2",
          type: "CREDIT_REQUEST",
          description: "New credit request submitted",
          userId: "user-2",
          userName: "Jane Smith",
          amount: 50000,
          timestamp: new Date(),
        },
        {
          id: "3",
          type: "DEPOSIT",
          description: "Deposit transaction completed",
          userId: "user-3",
          userName: "Bob Johnson",
          amount: 25000,
          timestamp: new Date(),
        },
      ];

      return res.status(200).json({
        activities: activities.slice(0, Number(limit)),
        total: activities.length,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /api/dashboard/analytics:
 *   get:
 *     summary: Get detailed analytics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Analytics data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/analytics",
  [
    authenticate,
    authorize("SUPER_ADMIN", "ADMIN"),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { startDate, endDate } = req.query;

      // TODO: Query client database for analytics
      const analytics = {
        dateRange: {
          start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: endDate || new Date(),
        },
        userMetrics: {
          registrations: [
            { date: "2024-01-01", count: 15 },
            { date: "2024-01-02", count: 20 },
            { date: "2024-01-03", count: 18 },
          ],
          activeUsers: [
            { date: "2024-01-01", count: 850 },
            { date: "2024-01-02", count: 870 },
            { date: "2024-01-03", count: 887 },
          ],
        },
        transactionMetrics: {
          volume: [
            { date: "2024-01-01", amount: 5000000 },
            { date: "2024-01-02", amount: 6500000 },
            { date: "2024-01-03", amount: 7200000 },
          ],
          count: [
            { date: "2024-01-01", count: 120 },
            { date: "2024-01-02", count: 145 },
            { date: "2024-01-03", count: 167 },
          ],
        },
        creditMetrics: {
          requests: [
            { date: "2024-01-01", count: 12 },
            { date: "2024-01-02", count: 15 },
            { date: "2024-01-03", count: 18 },
          ],
          approvalRate: 71.5,
          averageLoanSize: 95000,
          defaultRate: 2.3,
        },
      };

      return res.status(200).json({ analytics });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);

export default router;

import { Router, Request, Response } from 'express';
import { DomainCategory } from '../models/Domain';
import logger from '../utils/logger';

const router = Router();

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get all domain categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await DomainCategory.find({ active: true })
      .sort({ order: 1, name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error: any) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/categories/{slug}:
 *   get:
 *     summary: Get category by slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Category slug
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 */
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const category = await DomainCategory.findOne({ slug, active: true });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error: any) {
    logger.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Technology"
 *               slug:
 *                 type: string
 *                 example: "technology"
 *               description:
 *                 type: string
 *                 example: "Domains related to technology and software"
 *               icon:
 *                 type: string
 *                 example: "fas fa-code"
 *               color:
 *                 type: string
 *                 example: "#007bff"
 *               parentId:
 *                 type: string
 *               order:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug, description, icon, color, parentId, order } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required'
      });
    }

    // Check if slug already exists
    const existingCategory = await DomainCategory.findOne({ slug });
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Category slug already exists'
      });
    }

    const category = new DomainCategory({
      name,
      slug,
      description,
      icon,
      color,
      parentId,
      order: order || 0
    });

    await category.save();

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error: any) {
    logger.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

export default router;
import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { Category } from '../models/Listing';
import logger from '../middleware/requestLogger';

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('subcategories')
      .sort({ name: 1 });

    res.json({ success: true, data: categories });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 */
router.get('/:id', [
  param('id').isMongoId()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const category = await Category.findById(req.params.id)
      .populate('subcategories');

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    logger.error('Error fetching category:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category (Admin only)
 */
router.post('/', [
  body('name').isLength({ min: 2, max: 50 }),
  body('description').isLength({ min: 5, max: 200 }),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const category = new Category(req.body);
    await category.save();

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    logger.error('Error creating category:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
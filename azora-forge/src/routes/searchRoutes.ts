/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import { Listing } from '../models/Listing';
import logger from '../middleware/requestLogger';

const router = Router();

/**
 * @swagger
 * /api/search/listings:
 *   get:
 *     summary: Advanced search for listings
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: deliveryMethod
 *         schema:
 *           type: string
 *           enum: [digital, service]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, created_desc, created_asc]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 */
router.get('/listings', [
  query('q').optional().isLength({ min: 1 }),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      q,
      category,
      tags,
      minPrice,
      maxPrice,
      deliveryMethod,
      sortBy = 'created_desc',
      page = 1,
      limit = 20
    } = req.query;

    const searchQuery: any = { status: 'active' };

    // Text search
    if (q) {
      searchQuery.$text = { $search: q as string };
    }

    // Filters
    if (category) searchQuery.category = category;
    if (deliveryMethod) searchQuery.deliveryMethod = deliveryMethod;

    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice as string);
    }

    if (tags) {
      const tagArray = (tags as string).split(',').map(tag => tag.trim());
      searchQuery.tags = { $in: tagArray };
    }

    // Sorting
    let sortOption: any = { createdAt: -1 };
    switch (sortBy) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'created_asc':
        sortOption = { createdAt: 1 };
        break;
      case 'created_desc':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const listings = await Listing.find(searchQuery)
      .sort(sortOption)
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const total = await Listing.countDocuments(searchQuery);

    res.json({
      success: true,
      data: listings,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      },
      search: {
        query: q,
        filters: {
          category,
          tags: tags ? (tags as string).split(',').map(tag => tag.trim()) : undefined,
          priceRange: minPrice || maxPrice ? { min: minPrice, max: maxPrice } : undefined,
          deliveryMethod
        },
        sortBy
      }
    });
  } catch (error) {
    logger.error('Error searching listings:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/search/suggestions:
 *   get:
 *     summary: Get search suggestions
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 */
router.get('/suggestions', [
  query('q').isLength({ min: 1, max: 50 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { q } = req.query;

    // Get popular tags matching the query
    const tags = await Listing.distinct('tags', {
      tags: { $regex: q as string, $options: 'i' },
      status: 'active'
    });

    // Get category suggestions
    const categories = await Listing.distinct('category', {
      category: { $regex: q as string, $options: 'i' },
      status: 'active'
    });

    // Get title suggestions
    const titles = await Listing.find({
      title: { $regex: q as string, $options: 'i' },
      status: 'active'
    })
    .select('title')
    .limit(5);

    res.json({
      success: true,
      data: {
        tags: tags.slice(0, 10),
        categories: categories.slice(0, 5),
        titles: titles.map(t => t.title)
      }
    });
  } catch (error) {
    logger.error('Error getting search suggestions:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
import express from 'express';
import {
  getWireframeById,
  updateWireframe,
  deleteWireframe,
  listWireframes,
  generateCodeForWireframe,
  getGeneratedCodeByWireframeId,
  getGeneratedCodesByUserId,
  suggestSimilarDesigns,
  generateFullWireframe,
} from '../controllers/wireframe.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { uploadImage } from '../utils/imageUpload.js';

const router = express.Router();

// Main unified endpoint
router.post('/generate-full', authMiddleware, uploadImage, generateFullWireframe);

// Get wireframe by ID
router.get('/:id', authMiddleware, getWireframeById);

// Update wireframe
router.put('/update/:id', authMiddleware, updateWireframe);

// Delete wireframe
router.delete('/delete/:id', authMiddleware, deleteWireframe);

// List wireframes for authenticated user
router.get('/getwireframes', authMiddleware, listWireframes);  //d

// Generate code for wireframe
router.post('/:id/generate-code', authMiddleware, generateCodeForWireframe);

// Get generated code by wireframe ID
router.get('/generated-code/:id', authMiddleware, getGeneratedCodeByWireframeId);

// Get all generated codes for authenticated user
router.get('/all-codes/user', authMiddleware, getGeneratedCodesByUserId);

// Suggest similar designs based on text prompt
router.post('/suggestions', authMiddleware, suggestSimilarDesigns);

export default router;

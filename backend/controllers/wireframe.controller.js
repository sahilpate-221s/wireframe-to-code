import { GoogleGenerativeAI } from '@google/generative-ai';
import Wireframe from '../models/wireframe.model.js';
import GeneratedCode from '../models/generatedCode.model.js';
import AiRequestLog from '../models/AiRequestLog.model.js';
import axios from 'axios';


// Create a new wireframe with image upload
import { uploadImage, uploadToCloudinary } from '../utils/imageUpload.js';

// Helper: Generate code using selected AI
async function generateCode(aiUsed, prompt) {
  if (aiUsed === 'ChatGPT') {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content;
  } else if (aiUsed === 'Gemini') {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent({
      contents: [
        { text: `${prompt}\n\nOnly return clean code output.` }
      ]
    });
    const response = await result.response;
    return response.text();
  } else {
    throw new Error('Unsupported AI model');
  }
}

// Helper: Generate suggestions (dummy for now)
function getSuggestions(generatedCodeText) {
  return [
    {
      suggestionText: 'Variation 1: Add a header',
      codeSnippet: '<header>Header Example</header>\n' + generatedCodeText,
    },
    {
      suggestionText: 'Variation 2: Add a footer',
      codeSnippet: generatedCodeText + '\n<footer>Footer Example</footer>',
    },
    {
      suggestionText: 'Variation 3: Change background color',
      codeSnippet: `<div style='background: #f0f0f0'>${generatedCodeText}</div>`,
    },
  ];
}

// Main controller: Full wireframe flow
export const generateFullWireframe = async (req, res) => {
  try {
    const { textPrompt, language, aiUsed } = req.body;
    console.log('Received generateFullWireframe request with:', { textPrompt, language, aiUsed });
    if (!req.user || !req.user._id) {
      console.log('Unauthorized: User information missing');
      return res.status(401).json({ message: 'Unauthorized: User information missing' });
    }
    const userId = req.user._id;
    const validAiUsedValues = ['ChatGPT', 'Copilot', 'Gemini'];
    if (!validAiUsedValues.includes(aiUsed)) {
      console.log('Invalid aiUsed value:', aiUsed);
      return res.status(400).json({ message: `Invalid aiUsed value. Must be one of ${validAiUsedValues.join(', ')}` });
    }

    let imageUrl = '';
    if (req.file) {
      console.log('Uploading image to Cloudinary');
      imageUrl = await uploadToCloudinary(req.file.buffer);
      console.log('Image uploaded, URL:', imageUrl);
    }
    if (!imageUrl && !textPrompt) {
      console.log('No image or textPrompt provided');
      return res.status(400).json({ message: 'Either image or textPrompt must be provided.' });
    }

    // Create wireframe
    const wireframe = new Wireframe({
      user: userId,
      imageUrl,
      textPrompt: textPrompt || '',
      language,
      aiUsed,
    });
    await wireframe.save();
    console.log('Wireframe saved with ID:', wireframe._id);

    // Generate code
    const basePrompt = textPrompt || imageUrl || '';
    const prompt = `Generate responsive ${language} code for this prompt: ${basePrompt}`;
    let generatedCodeText = '';
    try {
      console.log('Calling AI code generation with prompt:', prompt);
      generatedCodeText = await generateCode(aiUsed, prompt);
      console.log('AI code generation successful');
    } catch (err) {
      console.error('AI code generation failed:', err.message);
      return res.status(500).json({ message: 'AI code generation failed', error: err.message });
    }

    // Suggestions
    const suggestions = getSuggestions(generatedCodeText);
    console.log('Suggestions generated');

    // Save generated code
    const generatedCodeDoc = new GeneratedCode({
      wireframe: wireframe._id,
      user: userId,
      code: generatedCodeText,
      language,
    });
    await generatedCodeDoc.save();
    console.log('Generated code saved');

    // Update wireframe with code and suggestions
    wireframe.generatedCode = generatedCodeText;
    wireframe.livePreview = `<div class='live-preview'>${generatedCodeText}</div>`;
    wireframe.suggestions = suggestions;
    await wireframe.save();
    console.log('Wireframe updated with generated code and suggestions');

    // Log AI request
    await new AiRequestLog({
      user: userId,
      wireframe: wireframe._id,
      aiModel: aiUsed,
      requestPayload: { prompt },
      responsePayload: { generatedCode: generatedCodeText },
      status: 'success',
      errorDetails: '',
    }).save();
    console.log('AI request logged');

    // Respond
    res.status(201).json({
      message: 'Wireframe created, code generated, and suggestions fetched successfully',
      wireframe,
      generatedCode: generatedCodeText,
      livePreview: wireframe.livePreview,
      suggestions,
    });
  } catch (error) {
    console.error('Failed to generate full wireframe:', error.message);
    res.status(500).json({ message: 'Failed to generate full wireframe', error: error.message });
  }
};

// Get wireframe by ID
export const getWireframeById = async (req, res) => {
  try {
    const wireframe = await Wireframe.findById(req.params.id).populate('user');
    if (!wireframe) {
      return res.status(404).json({ message: 'Wireframe not found' });
    }
    res.json(wireframe);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get wireframe', error: error.message });
  }
};

// Update wireframe
export const updateWireframe = async (req, res) => {
  try {
    const wireframe = await Wireframe.findById(req.params.id);
    if (!wireframe) {
      return res.status(404).json({ message: 'Wireframe not found' });
    }

    // Ownership check
    if (wireframe.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not own this wireframe' });
    }

    const { imageUrl, textPrompt, language, aiUsed } = req.body;

    if (imageUrl !== undefined) wireframe.imageUrl = imageUrl;
    if (textPrompt !== undefined) wireframe.textPrompt = textPrompt;
    if (language !== undefined) wireframe.language = language;
    if (aiUsed !== undefined) wireframe.aiUsed = aiUsed;

    await wireframe.save();
    res.json(wireframe);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update wireframe', error: error.message });
  }
};

// Delete wireframe
export const deleteWireframe = async (req, res) => {
  try {
    const wireframe = await Wireframe.findById(req.params.id);
    if (!wireframe) {
      return res.status(404).json({ message: 'Wireframe not found' });
    }

    // Ownership check
    if (wireframe.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not own this wireframe' });
    }

    await Wireframe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Wireframe deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete wireframe', error: error.message });
  }
};

// List wireframes for a user
export const listWireframes = async (req, res) => {
  try {
    const userId = req.user._id;
    const wireframes = await Wireframe.find({ user: userId });
    res.json(wireframes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to list wireframes', error: error.message });
  }
};


//generate code for wireframe using AI
export const generateCodeForWireframe = async (req, res) => {
  try {
    const wireframeId = req.params.id;
    const wireframe = await Wireframe.findById(wireframeId);
    if (!wireframe) {
      return res.status(404).json({ message: 'Wireframe not found' });
    }

    // Ownership check
    if (wireframe.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not own this wireframe' });
    }

    const userId = wireframe.user;
    const aiModel = wireframe.aiUsed;
    const basePrompt = wireframe.textPrompt || wireframe.imageUrl || '';

    if (!basePrompt) {
      return res.status(400).json({ message: 'No prompt available for code generation' });
    }

    // Craft full prompt with language
    const prompt = `Generate responsive ${wireframe.language} code for this prompt: ${basePrompt}`;

    // ChatGPT function
    const callChatGPT = async (prompt) => {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.choices[0].message.content;
    };

    // Gemini function using Google SDK
    const callGemini = async (prompt) => {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const result = await model.generateContent([
        { role: 'user', parts: [{ text: `${prompt}\n\nOnly return clean code output.` }] },
      ]);
      const response = await result.response;
      return response.text();
    };

    // AI handling logic
    let generatedCodeText = '';
    let status = 'success';
    let errorDetails = '';

    try {
      if (aiModel === 'ChatGPT') {
        generatedCodeText = await callChatGPT(prompt);
      } else if (aiModel === 'Gemini') {
        generatedCodeText = await callGemini(prompt);
      } else {
        return res.status(400).json({ message: 'Unsupported AI model' });
      }
    } catch (aiError) {
      status = 'failure';
      errorDetails = aiError.message || 'AI generation error';
      generatedCodeText = '';
    }

    // --- Enhancement: Generate dummy livePreview and suggestions ---
    // Dummy livePreview: wrap code in a <div> for HTML preview (customize as needed)
    let livePreview = `<div class='live-preview'>${generatedCodeText}</div>`;
    // Dummy suggestions: array of 3 variations
    let suggestions = [
      {
        suggestionText: 'Variation 1: Add a header',
        codeSnippet: '<header>Header Example</header>\n' + generatedCodeText,
      },
      {
        suggestionText: 'Variation 2: Add a footer',
        codeSnippet: generatedCodeText + '\n<footer>Footer Example</footer>',
      },
      {
        suggestionText: 'Variation 3: Change background color',
        codeSnippet: `<div style='background: #f0f0f0'>${generatedCodeText}</div>`,
      },
    ];
    // --- End enhancement ---

    // Save to GeneratedCode and Wireframe
    let generatedCodeDoc = null;
    if (status === 'success') {
      generatedCodeDoc = new GeneratedCode({
        wireframe: wireframeId,
        user: userId,
        code: generatedCodeText,
        language: wireframe.language,
      });
      await generatedCodeDoc.save();

      wireframe.generatedCode = generatedCodeText;
      wireframe.livePreview = livePreview;
      wireframe.suggestions = suggestions;
      await wireframe.save();
    }

    // Log request
    const aiRequestLog = new AiRequestLog({
      user: userId,
      wireframe: wireframeId,
      aiModel,
      requestPayload: { prompt },
      responsePayload: { generatedCode: generatedCodeText },
      status,
      errorDetails,
    });
    await aiRequestLog.save();

    if (status === 'failure') {
      return res.status(500).json({ message: 'AI code generation failed', error: errorDetails });
    }

    // --- Enhancement: Return all required fields ---
    res.json({
      message: 'Code generation successful',
      imageUrl: wireframe.imageUrl,
      generatedCode: generatedCodeText,
      livePreview,
      suggestions,
    });
    // --- End enhancement ---
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate code', error: error.message });
  }
};

// Get generated code by wireframe ID
export const getGeneratedCodeByWireframeId = async (req, res) => {
  try {
    const wireframeId = req.params.id;
    const generatedCode = await GeneratedCode.findOne({ wireframe: wireframeId });
    if (!generatedCode) {
      return res.status(404).json({ message: 'Generated code not found for this wireframe' });
    }
    res.json(generatedCode);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get generated code', error: error.message });
  }
};

// Get generated codes by user ID
export const getGeneratedCodesByUserId = async (req, res) => {
  try {
    const userId = req.user._id;
    const generatedCodes = await GeneratedCode.find({ user: userId });
    res.json(generatedCodes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get generated codes', error: error.message });
  }
};

// Suggest similar designs/code snippets based on textPrompt similarity
export const suggestSimilarDesigns = async (req, res) => {
  try {
    const { textPrompt } = req.body;
    if (!textPrompt) {
      return res.status(400).json({ message: 'textPrompt is required for suggestions' });
    }

    // Simple text search for similar wireframes based on textPrompt
    const similarWireframes = await Wireframe.find({
      textPrompt: { $regex: textPrompt, $options: 'i' },
    }).limit(5);

    // Fetch generated code snippets for these wireframes
    const suggestions = await Promise.all(
      similarWireframes.map(async (wf) => {
        const genCode = await GeneratedCode.findOne({ wireframe: wf._id });
        return {
          wireframeId: wf._id,
          textPrompt: wf.textPrompt,
          imageUrl: wf.imageUrl,
          generatedCode: genCode ? genCode.code : null,
        };
      })
    );

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get suggestions', error: error.message });
  }
};

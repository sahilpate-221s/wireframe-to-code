import mongoose from 'mongoose';

const suggestionSchema = new mongoose.Schema({
  suggestionText: { type: String, required: true },
  codeSnippet: { type: String, required: false },
});

const wireframeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    textPrompt: {
      type: String,
      required: false,
    },
    language: {
      type: String,
      required: true,
      enum: ['react', 'next', 'htmlcss', 'angular', 'php', 'javascript', 'others'],
    },
    aiUsed: {
      type: String,
      required: true,
      enum: ['ChatGPT', 'Copilot', 'Gemini'],
    },
    generatedCode: {
      type: String,
      required: false,
    },
    livePreview: {
      type: String,
      required: false,
    },
    suggestions: [suggestionSchema],
  },
  {
    timestamps: true,
  }
);

const Wireframe = mongoose.model('Wireframe', wireframeSchema);

export default Wireframe;

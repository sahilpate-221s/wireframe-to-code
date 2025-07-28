import mongoose from 'mongoose';

const aiRequestLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wireframe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wireframe',
      required: false,
    },
    aiModel: {
      type: String,
      required: true,
      description: 'Name of the AI model used (e.g., ChatGPT, Copilot, Gemini)',
    },
    requestPayload: {
      type: Object,
      required: true,
      description: 'Payload sent to the AI model',
    },
    responsePayload: {
      type: Object,
      required: true,
      description: 'Response received from the AI model',
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      required: true,
    },
    errorDetails: {
      type: String,
      default: '',
      description: 'Error message if the AI request failed',
    },
  },
  {
    timestamps: true,
  }
);

const AiRequestLog = mongoose.model('AiRequestLog', aiRequestLogSchema);

export default AiRequestLog;

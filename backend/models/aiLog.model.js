import mongoose from 'mongoose';

const aiLogSchema = new mongoose.Schema(
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
    aiProvider: {
      type: String,
      required: true,
    },
    requestPayload: {
      type: Object,
      required: true,
    },
    responsePayload: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      required: true,
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const AiLog = mongoose.model('AiLog', aiLogSchema);

export default AiLog;

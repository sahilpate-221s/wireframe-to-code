import mongoose from 'mongoose';

const wireframeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['react', 'next', 'htmlcss', 'angular', 'php', 'javascript'],
    },
    aiUsed: {
      type: String,
      required: true,
    },
    generatedCode: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Wireframe = mongoose.model('Wireframe', wireframeSchema);

export default Wireframe;

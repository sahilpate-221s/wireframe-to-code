import mongoose from 'mongoose';

const generatedCodeSchema = new mongoose.Schema(
  {
    wireframe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wireframe',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['react', 'next', 'htmlcss', 'angular', 'php', 'javascript', 'others'],
    },
  },
  {
    timestamps: true,
  }
);

const GeneratedCode = mongoose.model('GeneratedCode', generatedCodeSchema);

export default GeneratedCode;

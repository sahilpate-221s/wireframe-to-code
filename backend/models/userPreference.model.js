import mongoose from 'mongoose';

const userPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    preferences: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);

export default UserPreference;

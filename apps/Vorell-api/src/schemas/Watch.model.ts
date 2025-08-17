import { Schema } from 'mongoose';
import { WatchOrigin, WatchStatus, WatchType } from '../libs/enums/watch.enum';

const WatchSchema = new Schema(
  {
    watchType: {
      type: String,
      enum: Object.values(WatchType),
      required: true,
    },

    watchStatus: {
      type: String,
      enum: Object.values(WatchStatus),
      default: WatchStatus.IN_STOCK,
    },

    watchOrigin: {
      type: String,
      enum: Object.values(WatchOrigin),
      required: true,
    },

    modelName: {
      type: String,
      required: true,
    },

    brand: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    caseDiameter: {
      type: Number,
      required: false,
    },

    movement: {
      type: String,
      required: false,
    },

    waterResistance: {
      type: Number,
    },

    watchViews: {
      type: Number,
      default: 0,
    },

    likes: {
      type: Number,
      default: 0,
    },

    comments: {
      type: Number,
      default: 0,
    },

    rank: {
      type: Number,
      default: 0,
    },

    images: {
      type: [String],
      required: true,
    },

    description: {
      type: String,
    },

    isLimitedEdition: {
      type: Boolean,
      default: false,
    },

    releaseDate: {
      type: Date,
    },

    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Store', 
    },

    soldAt: {
      type: Date,
    },

    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true, collection: 'watches' },
);

WatchSchema.index({ watchType: 1, brand: 1, modelName: 1, price: 1 }, { unique: true });

export default WatchSchema;

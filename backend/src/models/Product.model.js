import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'bp_monitor',
        'glucometer',
        'thermometer',
        'weighing_scale',
        'acupressure',
        'massager',
        'other',
      ],
      required: true,
    },
    description: String,
    imageUrl: String,
    price: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
    },
    brand: String,
    isAvailable: {
      type: Boolean,
      default: true,
    },
    stockCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;

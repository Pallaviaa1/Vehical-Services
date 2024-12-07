const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Number,
    default: 0
  }
})

const productSchema = mongoose.Schema({
  /* merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }, */
  title: {
    type: String,
    require: true
  },
  description: {
    type: String,
    require: true
  },
  image: {
    type: Array,
    require: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  vehicle_type:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vehicleType"
  },
  make:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VehicleMaker"
  },
  model:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VehicleModel"
  },
  year:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VehicleYear"
  },
  modification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Modification"
  },
  price: {
    type: Number,
    require: true
  },
  qty: {
    type: Number,
    required: true,
    default: 1
  }
},
  { timestamps: true }
);


const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        /* merchantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user"
        }, */
        quantity: {
          type: Number,
          required: true,
          default: 1
        },
        name: String,
        price: Number
      }
    ],
    bill: [
      {
        type: Number
      }
    ],
    active: {
      type: Boolean,
      default: true
    },
    modifiedOn: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  cart: {
    totalQty: {
      type: Number,
      default: 1,
      required: true,
    },
    totalCost: {
      type: Number,
      default: 0,
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number,
          default: 0,
        },
        name: {
          type: String,
        }
      },
    ],
  },
  address: [
    {
      name: String,
      phone: Number,
      street: String,
      country: String,
      state: String,
      city: String,
      pincode: Number
    }
  ],
  paymentId: {
    type: String,
    required: true
  },
  orderNumber: {
    type: String,
    required: true
  },
  deliveryDate: {
    type: String,
    required: true,
  },
},
  { timestamps: true }
);


const orderItem = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },
  /*  merchantId:
   {
     type: mongoose.Schema.Types.ObjectId,
     ref: "user"
   }, */
  quantity: {
    type: Number,
    required: true
  },
  totalamount: {
    type: Number,
    required: true
  },
  order_status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered'],
    default: "pending"
  },
  order_cancel: {
    type: Boolean,
    default: 0
  }
},
  { timestamps: true }
);

const requestItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  productName: {
    type: String,
    required: true
  },
  make: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VehicleMaker"
  },
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VehicleModel"
  },
  year: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VehicleYear"
  },
  modification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Modification"
  }
},
  { timestamps: true }
);

const order_Schema = new mongoose.Schema(
  {
    orderItems: [
      {
        name: { type: String, required: true },
        image: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],
    totalQty: {
      type: Number,
      default: 1,
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shipping: {
      name: String,
      phone: Number,
      street: String,
      country: String,
      state: String,
      city: String,
      pincode: Number
    },
    payment: {
      paymentMethod: String,
      paymentResult: {
        orderID: String,
        payerID: String,
        paymentID: String,
      },
    },
    itemsPrice: Number,
    taxPrice: {
      type: Number,
      default: 0
    },
    shippingPrice: {
      type: Number,
      default: 0
    },
    totalPrice: Number,
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: Date,
  },
  {
    timestamps: true,
  }
);


const orderitem = mongoose.model('order', order_Schema);
const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model("Product", productSchema);
const Cart = mongoose.model("Cart", CartSchema);
const Order = mongoose.model("Order", OrderSchema);
const Order_Item = mongoose.model("orderItem", orderItem);
const RequestItem = mongoose.model("RequestItem", requestItemSchema);

module.exports = {
  Product, Cart, Order_Item, RequestItem, Category, orderitem, Order
}

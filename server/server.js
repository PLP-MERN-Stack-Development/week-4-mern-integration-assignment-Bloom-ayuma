// server.js - Main server file for the MERN blog application

// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import routes
const postRoutes = require('./routes/posts');
const categoryRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log requests in development mode
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// API routes
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('MERN Blog API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app; 

// 📄 server/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const postRoutes = require('./routes/postRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);

app.use(errorHandler);

module.exports = app;

// 📄 server/server.js
const mongoose = require('mongoose');
const app = require('./app');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
}).catch(err => console.error(err));

// 📄 server/models/Post.js
const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  image: { type: String },
}, { timestamps: true });
module.exports = mongoose.model('Post', postSchema);

// 📄 server/models/Category.js
const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});
module.exports = mongoose.model('Category', categorySchema);

// 📄 server/controllers/postController.js
const Post = require('../models/Post');
exports.getPosts = async (req, res) => {
  const posts = await Post.find().populate('category');
  res.json(posts);
};
exports.getPost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.json(post);
};
exports.createPost = async (req, res) => {
  const post = new Post(req.body);
  await post.save();
  res.status(201).json(post);
};
exports.updatePost = async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(post);
};
exports.deletePost = async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.status(204).end();
};

// 📄 server/controllers/categoryController.js
const Category = require('../models/Category');
exports.getCategories = async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
};
exports.createCategory = async (req, res) => {
  const category = new Category(req.body);
  await category.save();
  res.status(201).json(category);
};

// 📄 server/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/postController');

router.get('/', controller.getPosts);
router.get('/:id', controller.getPost);
router.post('/', controller.createPost);
router.put('/:id', controller.updatePost);
router.delete('/:id', controller.deletePost);

module.exports = router;

// 📄 server/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoryController');

router.get('/', controller.getCategories);
router.post('/', controller.createCategory);

module.exports = router;

// 📄 server/middlewares/errorHandler.js
module.exports = (err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
};

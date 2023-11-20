const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const admin = require('firebase-admin');
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require('cors')
const app = express();

app.use(cors());

admin.initializeApp();

const port = 3000;

app.use(bodyParser.json());

// mongodb uri
const mongoUri = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
const Product = mongoose.model("products", {
  name: String,
  brand: String,
  images: String,
  originalPrice:Number,
  resale:Number,
  purchase:String,
  usingTime:Number,
  number:String,
  location:String,
  select:String,
  description:String,
  updatedAt:String,
  createdAt:String,
  price: Number,
});

const Blogs = mongoose.model("blogs", {
 title:String,
 thumbnail:String,
 description:String,
 createdAt:String,
 updatedAt:String
});

// Secret key for JWT
const secretKey = process.env.SECRET_KEY || "ad1b13c9-6405-4c8b-b6c4-53f51f4b8d66";

// Middleware for JWT verification
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token)
    return res.status(403).send({ auth: false, message: "No token provided." });

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });

    req.userId = decoded.id;
    next();
  });
};

// Routes



  async function run() {
    try {
      //  ============== jwt ==================
  
      app.post("/login", (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, secretKey, {
          expiresIn: "1y",
        });
        res.send({ token });
      });

    } catch(err){
        console.error(err);
    }


// Create a new product
app.post("/products", verifyToken, async (req, res) => {
  try {
    const data = req.body;
    const product = new Product(data);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all products
app.get("/products", async (req, res) => {
  const page = req.query.page
  const limit = req.query.limit
  console.log(page,limit)
  try {
    const products = await Product.find().skip((page - 1) * limit).limit(limit);
    const count = await Product.estimatedDocumentCount()

    res.json({count,products});
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Get all products
app.get("/products/:id", async (req, res) => {
  const id = req.params.id
  const filter = { _id: mongoose.isObjectIdOrHexString(id) };

  try {
    const products = await Product.findById(id);

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a product
app.put("/products/:id", verifyToken, async (req, res) => {
  try {
    const data = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a product
app.delete("/products/:id", verifyToken, async (req, res) => {
  
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get products by category name
app.get("/category/:id", async (req, res) => {
  const id = req.params.id
  const search = new RegExp(`.*${id}.*`, 'gi')
  const page = req.query.page
  const limit = req.query.limit
  try {
    const products = await Product.find({brand:search}).skip((page - 1) * limit).limit(limit);
    const count = products?.length

    res.json({count,products});
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// blog
// Create a new blog
app.post("/blogs", verifyToken, async (req, res) => {
  try {
    const {title,thumbnail,description,createdAt,updatedAt} = req.body;
    console.log(req.body)
    const product = new Blogs({title,thumbnail,description,createdAt,updatedAt});
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Get all blogs
app.get("/blogs", async (req, res) => {
  const page = req.query.page
  const limit = req.query.limit
  console.log(page,limit)
  try {
    const blogs = await Blogs.find().skip((page - 1) * limit).limit(limit);
    const count = await Blogs.estimatedDocumentCount()

    res.json({count,blogs});
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Get one blog
app.get("/blogs/:id", async (req, res) => {
  const id = req.params.id
  const filter = { _id: mongoose.isObjectIdOrHexString(id) };

  try {
    const products = await Blogs.findById(id);

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a blog
app.put("/blogs/:id", verifyToken, async (req, res) => {
  try {
    const data = req.body;
    const product = await Blogs.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a blog
app.delete("/blogs/:id", verifyToken, async (req, res) => {
  
  try {
    const product = await Blogs.findByIdAndDelete(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Generate a JWT token for testing
app.post("/login", (req, res) => {
  const userId = 1; // Replace with your actual user ID
  const token = jwt.sign({ id: userId }, secretKey, { expiresIn: 86400 }); // Expires in 24 hours
  res.json({ auth: true, token });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
}
run() 
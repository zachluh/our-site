const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 5000;

require("dotenv").config()

app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',  // Tell Sequelize to use MySQL
  protocol: 'mysql', // Optional, but can help with certain setups
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database OK');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

const Post = sequelize.define('Post', {
  post_type: {
    type:DataTypes.STRING,
    allowNull: false
  },

  post_content: {
    type:DataTypes.STRING,
    allowNull: false
  },

  post_user: {
    type:DataTypes.STRING,
    allowNull: false
  }
});

sequelize.sync()
  .then(() => {
    console.log('Post table created successfully');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });


app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.findAll();
    res.json(posts);  
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/add-post', async (req, res) => {
  try {
    const {type, content, user} = req.body;

    console.log(req.body);

    const newPost = await Post.create({
      post_type: type,
      post_content: content,
      post_user: user
    });

    res.status(201).json({ status: 'success', post: newPost });
  } catch (error) {
    console.error('Error adding post:', error);
    res.status(500).json({ status: 'error', message: 'Error adding post' });
  }
});

app.delete('/delete/:id', async (req, res) => {
  console.log(`Request received to delete post with ID: ${req.params.id}`);
  const postID = req.params.id;
  try {
    const result = await Post.destroy({
      where: { id: postID },
    });

    if (result) {
      res.status(200).json({ message: `Post with ID ${postID} deleted successfully.` });
    } else {
      res.status(404).json({ message: `Post with ID ${postID} not found.` });
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Failed to delete post.' });
  }
});

const staticDir = path.join(__dirname, 'static');
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });  
  console.log('Created static directory');
}

const storage = multer.diskStorage({
     destination: (req, file, cb) => {
        cb(null, staticDir); 
      },
      filename: (req, file, cb) => {
        cb(null, file.originalname); 
      },
})

const upload = multer({storage:storage})

app.post('/upload', upload.single('file'), (req, res) => {

    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
      }

    const filePath = `/static/${req.file.filename}`;  
    res.json({ fileUrl:filePath });
});

app.use('/static', express.static(staticDir))

app.listen(port, () => {
    console.log(`Running on http://localhost:${port}`)
})

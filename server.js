const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const ejsLayouts = require("express-ejs-layouts");
const app = express();
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.set("layout", "layout");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use((req,res,next)=>{res.locals.session=req.session;next();});

const POSTS_FILE = path.join(__dirname, 'posts.json');

function loadPosts() {
  if (!fs.existsSync(POSTS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(POSTS_FILE));
  } catch {
    return [];
  }
}

function savePosts(posts) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

let posts = loadPosts();

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/cv', (req, res) => {
  res.render('cv');
});

app.get('/latest', (req, res) => {
  res.render('latest', { posts });
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    req.session.user = username;
    res.redirect('/admin');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

app.get('/admin', requireLogin, (req, res) => {
  res.render('admin', { posts });
});

app.get("/logout", (req,res)=>{req.session.destroy(()=>{res.redirect("/");});});
app.post('/posts', requireLogin, (req, res) => {
  const { title, content } = req.body;
  posts.push({ id: Date.now(), title, content });
  savePosts(posts);
  res.redirect('/admin');
});

app.get('/posts/:id', (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  if (!post) return res.status(404).send('Not found');
  res.render('post', { post, layout: false });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

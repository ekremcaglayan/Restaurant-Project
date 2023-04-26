const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/key.pem'),
  cert: fs.readFileSync('path/to/cert.pem')
};



const app = express();
app.use(bodyParser.json());

app.use(cookieParser('mazmegs'));
app.use(session({
  secret: 'mazmegs',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
  
}));

app.listen(3000, () => {
  console.log('Server has been started on port 3000.');
});

mongoose
  .connect("mongodb+srv://mehmetsemdinaktay:8e5GaYlmmOW8XD3y@cluster0.huw09px.mongodb.net/mazmegs", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB has been started on port 27017"))
  .catch((err) => console.error("MongoDB error", err));

  const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    surname: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      default: 'user',
    }
  });
  
  
  const foodSchema = new mongoose.Schema({
    name: String,
    content: String,
    price: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CategoryFood'
    },
    base: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BaseFood'
    }
  });
  
  const categoryFoodSchema = new mongoose.Schema({
    name: String,
    content: String,
    bases: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "BaseFood"
        }
      ]
  });
  
  const baseFoodSchema = new mongoose.Schema({
    name: String,
    categories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "CategoryFood"
        }
      ]
  });

  userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
  
  
  const User = mongoose.model("User", userSchema);
  const Food = mongoose.model('Food', foodSchema);
  const CategoryFood = mongoose.model('CategoryFood', categoryFoodSchema);
  const BaseFood = mongoose.model('BaseFood', baseFoodSchema);

app.use(express.urlencoded({
    extended: false
  })); // Not using bodyParser, using Express in-built body parser instead
  app.set("view engine", "ejs");
  app.use(express.static("public"));

app.get('/', (req, res) => {
  const user = req.session.user;
  res.render('anasayfa', {title: 'Anasayfa', user: user});
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Giriş bilgilerini doğrulayın
  const user = await User.findOne({email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Email veya şifre hatalı!' });
  }
  
  // Başarılı giriş durumunda
  req.session.user = user;
  return res.json({ message: 'Başarıyla giriş yapıldı.<br>Yönlendiriliyorsunuz...' });
});



// kullanıcının oturumunu sonlandırdığınızda session'dan kullanıcı bilgilerini silin
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

// Kayıt işlevi
app.post('/register', async (req, res) => {
  const { name, surname, email, password } = req.body;
  try {
    // Check if the user already exists
    const user = await User.findOne({ email });
    if (user) {
        return res.status(409).json({ message: 'Bu email zaten kullanımda!' });
    }

    // Create a new user
    const newUser = new User({ name, surname, email });
    newUser.password = await bcrypt.hash(password, 10);
    await newUser.save();

    // Send a success response
    req.session.user = newUser;
    return res.status(200).json({ message: 'Başarıyla kayıt oluşturuldu<br>Yönlendiriliyorsunuz...' });
  } catch (err) {
      // Handle errors
      console.error(err);
      return res.status(500).json({ message: 'Kayıt yapılırken bir hata oluştu.' });
  }
});


app.get("/profile", function(req,res){
  const user = req.session.user;
  if(user){
    res.render("profile", {title:'Profile - '+user.name, user: user})
  }else{
    res.redirect("/");
  }
});

app.get("/:navigation", function(req, res){
  const user = req.session.user;
  const navigation = req.params.navigation;
  res.render(navigation, {title: navigation, user: user});
});

app.post("/test", function(req,res){
  console.log(req.body.baseFood);
  console.log(req.body.specFood);
  console.log(req.body.priority);
  res.redirect("/");
});
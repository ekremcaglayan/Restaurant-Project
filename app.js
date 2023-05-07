const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    secret: 'mazmegs',
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);


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
      required: true,
      default: 'user',
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
    }
  });

  const restaurantSchema = new mongoose.Schema({
      //burasi yapilacaks

  });
  
  
  const foodSchema = new mongoose.Schema({
    name: String,
    content: String,
    price: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    category: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CategoryFood'
    }],
    base: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BaseFood'
    }]
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
  const Restaurant = mongoose.model('Restaurant', restaurantSchema);



  //yeni column ama object olarak
  /*User.updateMany({}, { $set: { restaurant: new mongoose.Types.ObjectId() } })
  .then(() => {
    console.log('Users updated successfully.');
  })
  .catch((err) => {
    console.error(err);
  });*/
  

//database add new column
 /* User.updateMany({}, {$set: {restaurant: ""}})
  .then(result => {
    console.log(result);
  })
  .catch(err => {
    console.log(err);
  });*/


app.get('/', (req, res) => {

  BaseFood.find().populate('categories')
  .then((baseFoods) => {
    const user = req.session.user;
    res.render('anasayfa', {title: 'Anasayfa', user: user, baseFoods: baseFoods});
  })
  .catch((err) => console.log(err));
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
  req.session = null;
  res.redirect("/");
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
  if(user.userType=="user"){
    res.render("profile", {title:'Profile - '+user.name, user: user})
  }
  else if(user.userType=="restaurant"){
    res.render("restaurantProfile", {title:'Restaurant Profile - '+user.name, user: user})
  }
  else{
    res.redirect("/");
  }
});

app.post("/test", function(req,res){
  console.log(req.body.baseFood);
  console.log(req.body.specFood);
  console.log(req.body.priority);
  res.redirect("/");
});


app.get('/base/:baseIds/categories', (req, res) => {
  const baseIds = req.params.baseIds.split(","); // get an array of base food IDs

  CategoryFood.find({ bases: { $in: baseIds } })
    .then(categories => {
      res.json(categories);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send("Error retrieving categories");
    });
});




app.get('/category/:categoryIds/:baseFoodIds/foods', (req, res) => {

  const categoryIds = req.params.categoryIds.split(",");
  const baseFoodIds = req.params.baseFoodIds.split(",");

  Food.find({ 
    category: { $in: categoryIds },
    base: { $in: baseFoodIds }
  })
  .then(foods => {
    res.json(foods);
  })
  .catch(err => {
    console.log(err);
    res.status(500).send("Error retrieving foods");
  });
});


app.get("/:navigation", function(req, res){
  
  const navigation = req.params.navigation;
  if(navigation != "favicon.ico"){
    const user = req.session.user;
    res.render(navigation, {title: navigation, user: user});
  }
});
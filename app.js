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
    name: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true
    },
    open: {
      type: String,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
      required: true
    },
    close: {
      type: String,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
      required: true,
    },
    location: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  });

  const starsSchema = new mongoose.Schema({
    speed: {
      type: Number,
      required: true,
    },
    taste: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant'
    }
  });
  
  const commentsSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    star: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stars',
    },
    comment: {
      type: String,
      required: true
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant'
    }
  });
  
  const foodSchema = new mongoose.Schema({
    name: String,
    content: String,
    price: Number,
    image: String,
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
    icon: String,
    bases: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "BaseFood"
        }
      ]
  });
  
  const baseFoodSchema = new mongoose.Schema({
    name: String,
    icon: String,
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
  const Stars = mongoose.model('Stars', starsSchema);
  const Comments = mongoose.model('Comments', commentsSchema);


  /*Restaurant.updateOne({}, { $unset: { user: "" } })
  .then(() => {
    console.log('Users updated successfully.');
  })
  .catch((err) => {
    console.error(err);
  });*/

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

app.get('/', async (req, res) => {

try{
  const user = req.session.user;
  const baseFoods = await BaseFood.find().populate('categories').exec();
  if(!baseFoods){
    return res.status(404).send("baseFoods not found");
  }
  const restaurants = await Restaurant.find().exec();
  if(!restaurants){
    return res.status(404).send("restaurants not found");
  }
  const stars = await Stars.find().populate('restaurant').exec();
  if(!stars){
    return res.status(404).send("stars not found");
  }

  res.render('anasayfa', {title: 'Anasayfa', user: user, baseFoods: baseFoods, restaurants:restaurants, stars:stars});

} catch(error){
  console.log(error);
  res.status(500).send("Internal Server Error");
}
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Giriş bilgilerini doğrulayın
  const user = await User.findOne({email }).populate('restaurant');
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
  console.log(req.body.baseSelect);
  console.log(req.body.categorySelect);
  console.log(req.body.foodSelect);
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


app.get("/restaurants/:restaurantId", async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;

    const user = await User.findOne({ restaurant: restaurantId }).exec();
    if (!user) {
      return res.status(404).send("User not found");
    }

    const foods = await Food.find({ user: user._id })
      .populate("user category base")
      .exec();

    const restaurant = await Restaurant.findOne({ _id: restaurantId }).exec();
    if (!restaurant) {
      return res.status(404).send("Restaurant not found");
    }

    const stars = await Stars.find({ restaurant: restaurant._id }).exec();
    let averageStars = 0;
    if (stars.length > 0) {
      let totalStars = 0;
      for (let i = 0; i < stars.length; i++) {
        totalStars += stars[i].speed + stars[i].taste + stars[i].price;
      }
      averageStars = totalStars / (stars.length * 3);
    }

    if (restaurantId !== "favicon.ico") {
      const user = req.session.user;
      res.render("restoran", {
        title: restaurant.name,
        user: user,
        restaurant: restaurant,
        foods: foods,
        averageStars: averageStars,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});



app.post('/SaveRestProfile', async (req, res) => {

  const {restoran_ismi,phone,address,mail,opened,closes} = req.body;

  console.log(restoran_ismi,phone,address,mail,opened,closes);

});

app.post('/SaveProfile', async (req, res) => {

  const {name,surname,phone,mail} = req.body;

  console.log(name,surname,phone,mail);

});

app.get('/restoranlar', async (req, res) => {

  try{
    const user = req.session.user;
    const restaurants = await Restaurant.find().exec();
    if(!restaurants){
      return res.status(404).send("restaurants not found");
    }
    res.render('restoranlar', {title: 'Restoranlar', user: user, restaurants:restaurants});
  
  } catch(error){
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
  });

app.get("/:navigation", function(req, res){
  
  const navigation = req.params.navigation;
  if(navigation != "favicon.ico"){
    const user = req.session.user;
    res.render(navigation, {title: navigation, user: user});
  }
});
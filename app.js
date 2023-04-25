const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();

app.use(
  session({
    secret: "mazmegs",
    resave: false,
    saveUninitialized: false,
  })
);

app.listen(3000, () => {
  console.log('Server has been started on port 3000.');
});

mongoose
  .connect("mongodb://127.0.0.1:27017/mazmegs", {
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
  res.render('anasayfa', {title: 'Anasayfa'});
});

app.get("/:navigation", function(req, res){

  const navigation = req.params.navigation;
  res.render(navigation, {title: navigation});
});

app.post("/test", function(req,res){
  console.log(req.body.baseFood);
  console.log(req.body.specFood);
  console.log(req.body.priority);
  res.redirect("/");
});
const express = require('express');
const app = express();
const ejs = require('ejs');

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

app.listen(3000, () => {
  console.log('Server has been started on port 3000.');
});
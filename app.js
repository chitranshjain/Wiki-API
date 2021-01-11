//Importing all the required packages
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

//Initialise the app
const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"));

//Connecting to the database
mongoose.connect("mongodb://localhost:27017/wikiDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//Defining the schemas
const articleSchema = mongoose.Schema({
    title: String,
    content: String
});

//Defining the model
const Article = mongoose.model("Article", articleSchema);

//Defining the routes
app.route("/articles")
    .get(function (req, res) {
        Article.find({}, function (err, articles) {
            if (err) {
                res.send(err);
            } else {
                res.send(articles);
            }
        });
    }).post(function (req, res) {
        console.log(req.body.title);
        console.log(req.body.content);
        const newArticle = new Article({
            title: req.body.title,
            content: req.body.content
        });

        newArticle.save(function (err) {
            if (err) {
                res.send(err);
            } else {
                res.send("Successfully added to the database");
            }
        });
    }).delete(function (req, res) {
        Article.deleteMany({}, function (err) {
            if (err) {
                res.send(err);
            } else {
                res.send("Deleted all articles from the database");
            }
        });
    });

app.route("/articles/:title")
    .get(function(req, res){
        let requestedTitle = _.lowerCase(req.params.title);
        Article.find({}, function(err, foundArticles){
            if(err) {
                res.send(err);
            } else {
                foundArticles.forEach(function(foundArticle) {
                    if(_.lowerCase(foundArticle.title) === requestedTitle) {
                        res.send(foundArticle);
                    }
                });
            }
        });
    })
    .put(function(req, res){
        Article.update({title: req.params.title}, 
            {
                title: req.body.title, 
                content: req.body.content
            }, {overwrite: true}, function(err, result){
                if(err) {
                    console.log("Error");
                    console.log(err);
                    res.send(err);
                } else {
                    console.log("Updating");
                    res.send("Successfully updated");
                }
            });
    })
    .patch(function(req, res){
        Article.update({title: req.params.title},
            {$set: req.body}, function(err){
                if(err) {
                    res.send(err);
                } else {
                    res.send("Successfully updated");
                }
            });
    })
    .delete(function(req, res){
        Article.deleteOne({title: req.params.title}, function(err){
            if(err) {
                res.send(err);
            } else {
                res.send("Successfully deleted");
            }
        });
    });

//Initialising the server
app.listen(3000, function () {
    console.log("Server is up and running on port 3000");
});
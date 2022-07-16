var express = require('express');
var app = express();
var fs = require("fs");
var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://localhost:27017/";


/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
const bodyParser = require("body-parser");
app.use(bodyParser.json());




/**
 * CORS Policy
 */
var cors = require('cors');
app.use(cors())





// ***-------------------------------------------------------------------------------------------------------------------------***
/**                                          API CALLS                                                                          */
// ***-------------------------------------------------------------------------------------------------------------------------***






/**
 * Get All Products
 */
app.get('/listProducts', function (req, res) {
   try {
      MongoClient.connect(url, function(err, db) {
         if (err) {
            res.json({message: err.message, status: 500});
         }
         else {
            var dbo = db.db("mydb");
            var query = { name: 'Chocolate Heaven' };
            dbo.collection("products").find().toArray(function(err, result) {
               if (err) {
                  res.json({message: err.message, status: 500});
                  db.close();
               }
               console.log(result);
               if(result.length > 0){
                  res.json(result);
               }else{
                  res.end( JSON.stringify({message: 'No Data'}) );
               }
               db.close();
            });
         }
      });      
   } 
   catch (error) {
      res.json({exMessage: error.message});
   }
});


/**
 * Get Data By Id
 */
app.get('/:id', function (req, res) {
   // First read existing users.
   fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
      var users = JSON.parse( data );
      var user = users["user" + req.params.id] 
      console.log( user );
      res.end( JSON.stringify(user));
   });
})


/**
 * Add Product
 */
app.post('/addProduct', function (req, httpResponse) {
   const bodyContent = req.body;
   var myobj={_id:bodyContent.id, name: bodyContent.name};
   console.log('req body',myobj);
   if(myobj._id && myobj.name){
      try {
         MongoClient.connect(url, function(err, db) {
            if (err){
               httpResponse.json(JSON.stringify({message: err.message, status: 500}));
            } else{
               var dbo = db.db("mydb");
               dbo.collection("products").insertOne(myobj, function(err, res) {
               if (err) {
                  httpResponse.end(JSON.stringify({message: err.message, status: 500}));
                  db.close();
               }
               else{
                  console.log('insertion',res);
                  httpResponse.end(JSON.stringify({'message': "added succesfully"}));
                  db.close();
               }
             });
            }
         });
      } catch (error) {
         httpResponse.end(JSON.stringify({exmessage: error.message}))
      }
   }
 
      
})



/**
 * Update Product
 */
app.put('/update', function (req,res) {
   const bodyContent = req.body;
   var myquery = { _id: bodyContent.id};
   var newvalues = { $set: {name: bodyContent.name } };
   MongoClient.connect(url, function(err, db) {
      if (err) {
         res.json(err);
      }
      else{
         var dbo = db.db("mydb");
         dbo.collection("products").updateOne(myquery, newvalues, function(err, dbres) {
            if (err){
               res.json(err);
            }
            else{
            console.log("1 document updated");
            db.close();
           }
         });
      }
   })
   res.json("updated succesfully");
});


/**
 * Delete
 */
app.delete('/delete/:id',  function (req,res) {
   const bodyContent = req.body;
   var myquery = { id: bodyContent.id};
   MongoClient.connect(url, function(err, db) {
      if (err) {

      }
      else{
         var dbo = db.db("mydb");
         dbo.collection("products").deleteOne(myquery, function(err, res) {
            if (err){

            }
            else{
               console.log("1 document deled");
               db.close();
            }
         });
      }
   })
   res.end(JSON.stringify({message: "Deleted"}));
});


/**
 * HOSTING APP INTO PORT : 8081
 */
var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log(host)
   console.log("Example app listening at http://%s:%s", host, port)
})
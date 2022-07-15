var express = require('express');
var app = express();
var fs = require("fs");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
const bodyParser = require("body-parser");


var cors = require('cors');
/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());
app.use(cors())

app.get('/listUsers', function (req, res) {
   MongoClient.connect(url, function(err, db) {
     if (err) throw err;
     var dbo = db.db("mydb");
     var myobj = [
       { id: 154, name: 'Chocolate Heaven'},
       { id: 155, name: 'Tasty Lemon'},
       { id: 156, name: 'Vanilla Dream'}
     ];
   //   dbo.collection("products").insertMany(myobj, function(err, result) {
   //    if (err) throw err;
   //    console.log(result);
   //    db.close();
   //    res.end( JSON.stringify(result) );

   //  });
     var query = { name: 'Chocolate Heaven' };
     dbo.collection("products").find().toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      if(result.length > 0){
         res.json(result);
      }else{
         res.end( JSON.stringify({message: 'No Data'}) );
      }
      db.close();
    });
   });

// ------------------------------------------------
 
})

app.get('/:id', function (req, res) {
   // First read existing users.
   fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
      var users = JSON.parse( data );
      var user = users["user" + req.params.id] 
      console.log( user );
      res.end( JSON.stringify(user));
   });
})

app.post('/addProduct', function (req, httpResponse) {
   const bodyContent = req.body;
   var myobj={_id:bodyContent.id, name: bodyContent.name};
   console.log('req body',myobj);
   if(myobj._id && myobj.name){
      try {
         MongoClient.connect(url, function(err, db) {
            if (err) throw err;
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
         });
      } catch (error) {
         httpResponse.end(JSON.stringify({exmessage: error.message}))
      }
   }
 
      
})

app.put('/update', function (req,res) {
   const bodyContent = req.body;
   var myquery = { _id: bodyContent.id};
   var newvalues = { $set: {name: bodyContent.name } };
   MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");
      dbo.collection("products").updateOne(myquery, newvalues, function(err, res) {
         if (err) throw err;
         console.log("1 document updated");
         db.close();

       });
   })
   res.json("updated succesfully");

})

app.delete('/delete/:id',  function (req,res) {
   const bodyContent = req.body;
   var myquery = { id: bodyContent.id};
   MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");
      dbo.collection("products").deleteOne(myquery, function(err, res) {
         if (err) throw err;
         console.log("1 document deled");
         db.close();

       });
   })
   res.end(JSON.stringify({message: "Deleted"}));

})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log(host)
   console.log("Example app listening at http://%s:%s", host, port)
})
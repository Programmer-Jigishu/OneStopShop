const express = require("express");
const PORT = process.env.PORT||3000;
const app = express();
const bodyParser = require("body-parser");
const { log } = require("console");
// Static Files
app.use(express.static(__dirname + '/public'));

// bodyparser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
// EJS
app.set('view engine', 'ejs');
const multer  = require('multer');
const path = require('path');
// ==========================================Multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(ext, '').toLowerCase().split(' ').join('_');
    cb(null, name + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage: storage });
// ==================================================================================================================================================================
// Add all the items in the lists

const fs = require('fs');
var features = "";
var albums ="";
// Features for Sale
const allFeatureElements = fs.readdirSync("./public/img/features");
console.log(allFeatureElements);
const feature_description = fs.readFileSync("./public/img/feature-description.json");
const feaes = JSON.parse(feature_description);
const feaes_value = Object.values(feaes);
const feaes_keys = Object.keys(feaes);
console.log(feaes_value,feaes_keys);
var i =0;
allFeatureElements.forEach((item)=>{
	
    features+=`<div class="col d-flex align-items-start">
        <img src="/img/features/${item}" alt="features">
        <div>
          <h3 class="fw-bold mb-0 fs-4">${feaes_keys[i].toUpperCase()}</h3>
          <p>${feaes_value[i]}</p>
        </div>
    </div>`;
    i++;    
    });
    
    //Album for Sale

const allAlbumElements = fs.readdirSync("./public/uploads");
console.log(allAlbumElements);
allAlbumElements.forEach((item)=>{
 albums+=`<div class="col">
 <div class="card shadow-sm">
   <img src="/uploads/${item}" alt="item">
   <div class="card-body">
     <p class="card-text">Go to Shop Section to Order Now!</p>
     <div class="d-flex justify-content-between align-items-center">
       <div class="btn-group">
         <button type="button" class="btn btn-sm btn-outline-secondary" style="direction: ltr;">Fresh</button>
         <button type="button" class="btn btn-sm btn-outline-secondary" style="direction: ltr;">Trending</button>
       </div>
       <button type="button" class="btn btn-sm btn-outline-warning" ><a style="text-decoration:none" href="/shophere">Shop Now</a></button>
     </div>
   </div>
 </div>
</div>`   
}); 
// console.log(features);
// fs.writeFileSync("./views/features.ejs",features); // No need Just for Extra

// ==================================================================================================================================================================



// DataBase

const { MongoClient } = require("mongodb");
// Replace the uri string with your connection string.
const uri = "mongodb+srv://jigishuatp:Galav14t@cluster0.a5fjqyw.mongodb.net/?retryWrites=true&w=majority";;
const client = new MongoClient(uri);





// ==================================================================================================================================================================


const cart ={}; // item:quantity


app.get('/', (req, res) => {
    res.render('newEjs', {allFeatures: features,allAlbum:albums});
  });

  app.get('/shopkeeper', async (req, res) => {
    console.log(req.body);
    res.render('shopLogin', {});
  });

// ========================
app.post('/shopkeeper', async (req, res) => {

  const username = req.body.userName;
  const password = req.body.password;

  try {
    const client = await MongoClient.connect(uri);
    const usersCollection = client.db("ShoppingApp").collection('users');

    const user = await usersCollection.findOne({ userName: username, password: password });

    if (user) {
      // User found, render the success page
      console.log("Success");
      const itemsCollection = client.db("ShoppingApp").collection("items");

      const items = await itemsCollection.find({}, { projection: { itemName: 1, itemQuantity: 1, itemPrice: 1,description:1,imageData:1}, sort: { title: 1 } }).toArray();

      const all = items.map(item => {
        return `<div class="row"><span class="img-fluid btn col"><img  style="width:10rem;height:10rem; object-fit: contain;" src="${item.imageData.slice(1)}">${item.imageData.slice(1)}</span><span class="col">${item.itemName}</span><span class="btn col">${item.itemQuantity}</span><span class="btn col">${item.itemPrice}</span><span class="btn col">${item.description}</span><br></div>`;
      }).join('');

      res.render('shopKeeper', { allFeatures: all });
    } else {
      // User not found, render the login page with an error message
      console.log("No such User");
      res.render('shopLogin', { error: 'Invalid username or password' });
    }

    await client.close();
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});



  



    // ======================
    







app.post("/",(req,res)=>{
    console.log(req.body);
    res.send("Checking your item");
});


app.post('/shopkeeper-update', upload.single('image'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  console.log(req.body);
  const updateArray = req.body;

  async function insertDocuments(updateArray) {
      const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

      try {
          const database = client.db("ShoppingApp");
          const items = database.collection("items");
          updateArray["originalName"] =req.file.filename;
          
          updateArray["imageData"] =`./uploads/${req.file.filename}` ;
          console.log(updateArray)
          const result = await items.insertOne(updateArray);
          console.log(`1 document was inserted`);
          
      } catch (err) {
          console.log(err);
          return false;
      } finally {
          // client.close();
      }
  }
  

  // Call the function with await
  async function myFunction() {
      const success = await insertDocuments(updateArray);
      console.log(success);
      // res.redirect('/shopkeeper');
  }

  myFunction();
});


app.post("/button-clicked", (req, res) => {
    const buttonId = req.body;
    console.log(buttonId);
    res.sendStatus(200);
  });

  
  app.get("/checkout",(req,res)=>{
    const client = new MongoClient(uri);

    async function getTextStrings() {
      try {
        await client.connect();
        const database = client.db("ShoppingApp");
        const collection = database.collection("orderList");
        console.log("Connected To Database")
        const documents = await collection.findOne({});     
         return documents;
    
      }finally {

        await client.close();
      }
    }
    
    async function fetchData(){
      const data = await getTextStrings();
      console.log(data);
      console.log("From Here");
      res.render("checkout",{data:data});
    
    }
    
    fetchData();

    
  });
  


  app.post("/check-out",async(req,res)=>{
  const newData = req.body;
  console.log(newData);
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const collection = client.db("ShoppingApp").collection("CustomerDetails");
    await collection.insertOne(newData); // Insert data into MongoDB
    // res.redirect("/checkout"); // Redirect to app.get("/123")
  } finally {
    await client.close();

  }


  
  res.send(`
  Thank you for placing your order with us! We appreciate your business and will process your order as soon as possible. If you have any questions or concerns, please do not hesitate to contact us.
  `);
  // res.redirect('/last');
});

app.get('/last',async(req,res)=>{
  await database("ShoppingApp").collection('orderList').deleteMany({}, function(err, obj) {
    if (err) throw err;

    console.log(obj.result.n + ' document(s) deleted');
  });
})
app.get("/shophere",(req,res)=>{

  const client = new MongoClient(uri);

async function getTextStrings() {
  try {
    await client.connect();
    const database = client.db("ShoppingApp");
    const collection = database.collection("items");
    const documents = await collection.find({}).toArray();
    return documents;

  }finally {
    await client.close();
  }
}

async function fetchData(){
  const data = await getTextStrings();
  console.log(data);
  res.render("shophere",{data:data});

}

fetchData();
});


app.post("/shophere",async(req,res)=>{
// ==================Here==============
console.log(req.body);
const data = req.body;
const newData = {};

for (const key in data) {
  newData[key] = {
    quantity: data[key][0],
    name: data[key][1],
    price: data[key][2]
  };
}

console.log(newData);

const client = new MongoClient(uri);
  try {
    await client.connect();
    const collection = client.db("ShoppingApp").collection("orderList");
    await collection.insertOne(newData); // Insert data into MongoDB
    res.redirect("/checkout"); // Redirect to app.get("/123")
  } finally {
    await client.close();
  }

});

app.listen(PORT,()=>{
    const date = new Date();
    
    console.log("Server Started on Port 3000 at time ",date.toLocaleTimeString());

})
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const session = require('express-session');

const app=express();
const port = process.env.port || 4000;

async function main(){
    await  mongoose.connect(process.env.db_url_live)
  }
  
  main()
  .then(()=>{
    console.log("mongo db server is connected")
  })
  .catch((err)=>{
    console.log(err)
  })

//middlewares
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(
    session({
        secret:"My secret key",
        saveUninitialized:true,
        resave:false,
    })
);

app.use(express.static('uploads'))

//set template engine
app.set("view engine" , "ejs");

//route prefix
app.use("",require("./routes/routes"));

app.listen(port,()=>{
    console.log(`server started at http://localhost:${port}`);
})

const mysql=require('mysql2');

var db=mysql.createConnection({
   
    host:"sql6.freesqldatabase.com",
    database:"sql6515462",
    user:"sql6515462",
    password:"fjzMLy8DGe",


    // host:"localhost",
    // database:"capsulepharma",
    // user:"root",
    // password:"Jona@147",

});

db.connect((err)=>{
    if(err)
      throw err;
    console.log("Data Base Connected ");

});

module.exports=db;
const mysql=require('mysql2');

var db=mysql.createConnection({
   
    host:"localhost",
    database:"capsulepharma",
    user:"root",
    password:"Jona@147",

});

db.connect((err)=>{
    if(err)
      throw err;
    console.log("Data Base Connected ");

});

module.exports=db;
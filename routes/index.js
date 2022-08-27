var express = require('express');
const session = require('express-session');
var router = express.Router();
var bcrypt = require('bcrypt');



var db = require('../database');
const { Cookie } = require('express-session');
let name = "Admin";
let loggedIn='false';
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login2', { title: 'Capsule Pharma', session: req.session, error: '' });
});

router.post('/login', (req, res, next) => {

  var email = req.body.email;
  var password = req.body.password;
  console.log(email);
  console.log(password);
  var hash = bcrypt.hashSync(password, 2);
  console.log(hash);
  const bcryptPassword = bcrypt.compareSync(password, hash);
  console.log(bcryptPassword);

  if (email && bcryptPassword) {
    var sql = `SELECT * FROM admintable WHERE user_email = "${email}" `;
    db.query(sql, (error, data, next) => {

      if (data.length > 0) {
        for (var count = 0; count < data.length; count++) {
          if (bcrypt.compareSync(password, data[count].user_password)) {
            req.session.user_id = data[count].user_id;
            name = data[count].user_name;
            loggedIn = true;
            res.redirect('/dashboard');
            // res.render('index', { title: "Home page", session: req.session, username: name, action: "dashboard", totalmed: "620", medicines: "322", lessstock: "0",rev:94,bill:2 });
          }
          else {
            res.render('login2', { error: 'Invalid password', session: req.session });


          }
          return { name, loggedIn };
        }
      }
      else {
        res.render('login2', { error: 'Invalid username', session: req.session });


      }
      res.end();

    });

  }
  else {

    res.render('login2', { error: 'Invalid credentials', session: req.session });
    res.end();
  }


});

router.get('/logout', function (request, response, next) {

  request.session.destroy();

  response.redirect("/");

});

router.get('/signup', (req, res, next) => {
  res.render('signup', { title: 'Capsule Pharma', session: req.session, error: '' });
})

router.post('/register', (req, res, next) => {
  console.log("eeeeeeee");
  uname = req.body.uname,
    umail = req.body.uemail;
    mobile = req.body.umobile;
 
    password = req.body.password,
    confirm_password = req.body.cpassword


      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]; 
      const d = new Date();
      var dd = String(d.getDate()).padStart(2, '0');
      var mm = String(d.getMonth() + 1).padStart(2, '0');
      var yyyy = d.getFullYear();
      var fullDate = +dd +"-"+ monthNames[d.getMonth()] +"-"+ yyyy;

  if (confirm_password != password) {
    res.render('signup', { title: "Home page", error: "Password not Matching" })
  } else {

    // save users data into database

    bcrypt.hash(password, 2, (error, hash) => {
      if (error) throw error;
      password = hash;
      console.log(password);
      var sql = "INSERT INTO admintable (user_name,user_email,user_password,user_mobile,date_of_join) VALUES ('" + uname + "','" + umail + "','" + password + "','" + mobile + "','" + fullDate + "')";
      db.query(sql, function (err, data) {
        if (err) throw err;
        res.render('signup', { title: "Home page", error: " Successfully Registered" });
      });

    });
    // const hashedpass=bcrypt.hashSync(password,5);
    // var sql="INSERT INTO admintable (user_name,user_email,user_password,user_mobile,user_type) VALUES ('"+uname+"','"+umail+"','"+hashedpass+"','"+mobile+"','"+user_type+"')";
    // db.query(sql,function (err, data) {
    //  if (err) throw err;
    //  res.render('signup',{title:"Home page", error:"Successfully registered"});
    // });


  }

});

//DASHBOARD

router.get("/dashboard", (req, res) => {
  var username = name;
  console.log(loggedIn);
  if (loggedIn!=false) {
    var sql1 = `SELECT SUM(stock) AS count1 FROM medicines`;
    var sql2 = `SELECT COUNT(*) AS count2 FROM medicines`;
    var sql3 = `SELECT COUNT(*) AS count3 FROM medicines WHERE stock < 10`;
    var sql4=`SELECT SUM(amount) AS totalamt FROM invoices`;
    var sql5 = `SELECT COUNT(*) AS bill FROM invoices`;

    db.query(sql1, (error, data, next) => {
      if (error) throw error;
      console.log(data[0].count1);
      var totalmed = data[0].count1;

      db.query(sql2, (req, data, next) => {
        if (error) throw error;
        console.log(data[0].count2);
        var medicines = data[0].count2;

        db.query(sql3,(error,data,next)=>{
          if (error) throw error;
          console.log(data[0].count3);
          var lessstock=data[0].count3;
          db.query(sql4,(error,data,next)=>{
            if (error) throw error;
            console.log(data[0].totalamt);
            var rev=Math.round(data[0].totalamt);

            db.query(sql5,(error,data,next)=>{
              if (error) throw error;
              console.log(data[0].bill);
              var tBill=data[0].bill;
    
            res.render("index", { action: 'dashboard', username: username, totalmed: totalmed, medicines: medicines, lessstock:lessstock,rev:rev ,bill:tBill});
    
    
            });
  
          
  
  
          });

       


        });
      });


    });
  }
  else{
    res.render('login', { title: 'Capsule Pharma', session: req.session, error: '' });
  }
  // res.render('index',{action:"dashboard",username:name});
  // return res.redirect('/login');
});

  ///MEDICINE LIST
router.get("/medList",(req,res)=>{
  var username = name;
  sql = "SELECT * FROM medicines";
  db.query(sql, (error, data) => {
    if (error)
      throw error;
      res.render('medicineList', { title: 'Capsule Pharma',username: username, sampleData:data ,session: req.session, error: '' });
  });
  

})

 ///ADD-MEDICINE

router.get("/addMed",(req,res)=>{
  var username = name;
  res.render('add-medicine', { title: 'Capsule Pharma',username: username, session: req.session, error: '' });
});
router.post('/addnew', (request, response) => {
  var username = name;
  var mname = request.body.medname;
  var stock = request.body.stock;
  var batch = request.body.batch;
  var sales_price = request.body.sales_price;
  var expdate = request.body.expdate;
  var purchase_date = request.body.purchase_date;
  var purchase_price = request.body.purchase_price;
  
  
  var sql = "insert into medicines(medicine_name,medBatch,medExpDate,price,stock,purchase_price,purchase_date,refilled_date) values('" + mname + "','" + batch + "','" + expdate + "','" + sales_price + "','" + stock+ "','" + purchase_price + "','" + purchase_date + "','" + purchase_date + "');"
  // var sql2 = "insert into med_purchase(Medicine_name,Batch_No,Quantity,price_per_unit,Purchase_Date,exp_date) values('" + mname + "','" + batch + "','" + stock+ "','" + purchase_price + "','" + purchase_date + "','" + expdate + "');"
   
  // db.query(sql, function (error, data) {

  //   if (error)
  //     throw error;
  //   console.log("inserted")
    // response.render('add-medicine', { title: 'Capsule Pharma',username: username, session: request.session, error: 'Inserted' });

    db.query(sql, function (error, data) {

      if (error)
        throw error;
      console.log("inserted")
      response.render('add-medicine', { title: 'Capsule Pharma',username: username, session: request.session, error: 'Inserted' });
  
  
    });


//   });
});

//DELETE

router.get('/delete-product/:id', (request, response) => {

  var id = request.params.id;
  var sql = `DELETE FROM medicines WHERE m_id="${id}"`;

  // var s1=`SET @count = "${id}"`;
  // var s2=`UPDATE sample1 SET "${id}" = @count:= @count - 1`;
  // var s3=`ALTER TABLE sample1 AUTO_INCREMENT = "${id}"`;

  db.query(sql, (error, data) => {
    if (error)
      throw error;
      console.log("deleted");
      response.redirect("/medList")
  });
})

///EDIT-MEDICINE

router.get('/edit-product/:id', (request, response) => {
  var username = name;
  var id = request.params.id;
  var sql = `SELECT * FROM medicines WHERE m_id="${id}"`;

  db.query(sql, (error, data) => {

    response.render("edit-medicine", { title: 'Edit Data', action: 'edit', sampleData: data[0],username:username });
  });

});

router.post('/edit/:id', (request, response) => {

  var username = name;
  var id = request.params.id;
  var mname = request.body.medname;
  var stock = request.body.stock;
  var batch = request.body.batch;
  var price = request.body.price;
  var expdate = request.body.expdate;

  var sql = `UPDATE medicines SET 
           medicine_name="${mname}",
           medBatch="${batch}",
           medExpDate="${expdate}",
           price="${price}",
           stock="${stock}" WHERE m_id="${id}"`;

  db.query(sql, (error, data) => {
    if (error)
      throw error;
      response.redirect("/medList");
  });


});

// router.get("/invoice",(req,res)=>{
//   var username = name;
//   res.render('invoices', { title: 'Capsule Pharma', session: req.session, error: '' ,username:username});

// });


      /////CART
///ADD TO CART

router.get('/add-cart/:m_id/:medicine_name/:price/:stock', (request, response) => {

  console.log("entered");
  var id = request.params.m_id;
  var name = request.params.medicine_name;
  var price = request.params.price;
  var stock = request.params.stock;
  console.log(id,name, price,stock);
  // var name=`select Med_name ,Stock from sample1 where ID="${id}"`;
  // console.log(stock);

  var sql = "insert into medcart(m_id,medicine_name,price,stock) values('" + id + "','" + name + "','" + price+ "','" + stock + "')";

  db.query(sql,(error, data) => {
    
    response.redirect('/medList');
    console.log("success");
  });

});


//DISPLAY CART
router.get('/invoice', (request, response) => {
  var username = name;
  var sql = `SELECT * FROM medcart`;

  db.query(sql, (error, data) => {

    if (error) throw error;
    response.render('invoices', { title: "INVOICE", sampleData: data,username:username });
  });

});

///quantity update cart

router.post('/cartupdate/:id', (request, response, next) => {
  var id = request.params.id;
  var iquantity = request.body.iquantity;
  
  // alert(iquantity);
  console.log(iquantity);
  var sql = `UPDATE medcart SET 
           quantity="${iquantity}"
            WHERE m_id="${id}"`;
  var sql3 = `update medcart set medcart.amount=medcart.quantity*medcart.price where m_id="${id}"`;
 

  // var sql2 = `UPDATE sample1 SET Stock = (SELECT Stock WHERE id ="${id}")-"${iquantity}" WHERE id="${id}"`;


  db.query(sql, function (error, data) {

    if (error)
      throw error;
    console.log("updated");
    // response.redirect('/invoice');
   

    db.query(sql3, function (error, data) {

      if (error)
        throw error;
      console.log("updated");
      response.redirect('/invoice');
      
  
    //   // db.query(sql2, function (error, data) {
  
    //   //   if (error)
    //   //     throw error;
    //   //   console.log("updated sample1");
    //   //   response.redirect('/cart');
       
    
    
      // });
  
  
    });


  });

});

///DELETE CART PRODUCT

router.get('/delete-product-cart/:id', (request, response) => {

  console.log("entered")
  var id = request.params.id;
  console.log(id)
  var sql = `DELETE FROM medcart WHERE m_id="${id}"`;

  // var s1=`SET @count = "${id}"`;
  // var s2=`UPDATE sample1 SET "${id}" = @count:= @count - 1`;
  // var s3=`ALTER TABLE sample1 AUTO_INCREMENT = "${id}"`;

  db.query(sql, (error, data) => {
    if (error)
      throw error;
    response.redirect('/invoice');
  });
});



router.post('/bill', (request, response) => {
  var username=name;
  var buyername = request.body.bname
  var bnum = request.body.bnum;
  var gtotal = request.body.gtotal;

  console.log(username);
  console.log(buyername);
  console.log(bnum);
  console.log(gtotal);

  var sql = "insert into invoices(b_name,b_mobile,admin_name,amount) values('" + buyername + "','" + bnum + "','" + username + "','" + gtotal + "');"
  var sql2 = `update medicines set medicines.stock=medicines.stock-(select quantity from medcart where medcart.m_id=medicines.m_id AND medcart.medicine_name=medicines.medicine_name)where m_id =(select m_id from medcart where medcart.m_id=medicines.m_id)`;
  

  db.query(sql, function (error, data) {

    if (error)
    throw error;
    console.log("inserted");
    // response.redirect('/print');

    db.query(sql2, function (error, data) {

      if (error)
        throw error;
      console.log("updated sample1");
      response.redirect('/print');
    });
  });

});



              ///USER-MANAGE
router.get("/userManage",(req,res)=>{
var username=name;
var sql = `SELECT * FROM admintable`;
db.query(sql, (error, data) => {
  if (error)
    throw error;
    res.render('userManage', { title: 'Capsule Pharma',username: username, sampleData:data ,session: req.session, error: '' });
});

});

router.get('/delete-user/:id', (request, response) => {

  console.log("entered")
  var id = request.params.id;
  console.log(id)
  var sql = `DELETE FROM admintable WHERE user_id="${id}"`;

  // var s1=`SET @count = "${id}"`;
  // var s2=`UPDATE sample1 SET "${id}" = @count:= @count - 1`;
  // var s3=`ALTER TABLE sample1 AUTO_INCREMENT = "${id}"`;

  db.query(sql, (error, data) => {
    if (error)
      throw error;
    response.redirect('/userManage');
  });
});

///REPORTS

router.get("/reports",(req,res)=>{
  var username=name;
  var sql = `SELECT * FROM invoices`;
  db.query(sql, (error, data) => {
    if (error)
      throw error;
      res.render('reports', { title: 'Capsule Pharma',username: username, sampleData:data ,session: req.session, error: '' });
  });
  
  });

  //Purchase-Info
  router.get("/iteminfo",(req,res)=>{
    var username = name;
    sql = "SELECT * FROM medicines";
    db.query(sql, (error, data) => {
      if (error)
        throw error;
        res.render('Medicine-info', { title: 'Capsule Pharma',username: username, sampleData:data ,session: req.session, error: '' });
    });
    
  
  })

//PRINT-BILL

router.get('/print', (request, response, next) => {


  var sql = "select * from medcart ORDER BY medicine_name";
  var sql2 = "Select amount as count from invoices where purchase_date = (Select max(purchase_date) from invoices)";
  var sql3 = "Select b_id as b from invoices where purchase_date = (Select max(purchase_date) from invoices)";
  var sql4 = "Select b_name as name from invoices where purchase_date = (Select max(purchase_date) from invoices)";
  

  db.query(sql2, (error, data) => {

    if (error) throw error;
    console.log(data[0].count);
    var s1 = data[0].count;

    db.query(sql, (error, data1) => {

      if (error) throw error;
      
      // response.render('print', { title: "INVOICE", action: "cart", sampleData: data, gtotal: s1 });

      db.query(sql3, (error, data) => {
        var s2 = data[0].b;
        if (error) throw error;
        // response.render('print', { title: "INVOICE", action: "cart", sampleData: data1, gtotal: s1 ,billId:s2});


        db.query(sql4, (error, data) => {
          var s3 = data[0].name;
          if (error) throw error;
          response.render('print', { title: "INVOICE", action: "cart", sampleData: data1, gtotal: s1 ,billId:s2,name:s3});
    
    
        });
  
  
      });


    });

  });



});


router.get('/clearcart', (request, response) => {

  
  var sql = `DELETE FROM medcart`;
  console.log("cart clearing ok")

  db.query(sql, function (error, data) {

    if (error)
      throw error;
      console.log("cart cleared")
    response.redirect("/medList");


  });
});


module.exports = router;

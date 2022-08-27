router.post('/login',(req,res,next)=>{

    var email=req.body.email;
    var password=req.body.password;
    console.log(email);
    console.log(password);
    var hash = bcrypt.hashSync(password, 5);
    console.log(hash);
    const bcryptPassword = bcrypt.compareSync(password, hash);
    console.log(bcryptPassword);
  
    if(email && password)
    {
      var sql=`SELECT * FROM admintable WHERE user_email = "${email}" `;
      db.query(sql, (error, data, next) => {
        
             if(data.length > 0)
              {
                  for(var count = 0; count < data.length; count++)
                  {
                      if(data[count].user_password == password)
                      {
                          req.session.user_id = data[count].user_id;
  
                          res.render('home',{title:"Home page", session:req.session,data:data[count].user_name });
                      }
                      else
                      {
                        res.render('login', { error: 'Incorrect Password ', session:req.session });
                        
                        
                      }
                  }
              }
              else
              {
                  res.render('login', { error: 'Incorrect Email Address', session:req.session });
                  
                
              }
              res.end();
  
      });
  
    }
    else{
          
          res.render('login', { error: 'Please Enter Email Address and Password Details', session:req.session });
          res.end();
    }
  
  
  });
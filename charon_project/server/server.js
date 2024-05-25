import express from 'express';
import {createPool} from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';                  /* Security-related HTTP headers to enhance browser security
                                              By adding app.use(helmet()), your Express application automatically includes the following security headers:
                                              
                                              Content-Security-Policy:    Helps prevent XSS attacks.
                                              Strict-Transport-Security:  Instructs the browser to always use HTTPS.
                                              X-Content-Type-Options:     Prevents MIME-sniffing vulnerabilities.
                                              X-Frame-Options:            Prevents your web pages from being embedded within an iframe.
                                              X-XSS-Protection:           Enables the browser's built-in XSS protection.*/
                                              
import { check, validationResult } from 'express-validator'; // Prevent SQL injection, XSS, and other injection attacks
import rateLimit from 'express-rate-limit';   // Implement rate limiting to prevent abuse and brute force attacks.
import bcrypt from 'bcrypt';                  // Hashing library 

const app = express();
const PORT = 3001;
const saltRounds = 10;                        // Number of salt rounds to use during hashing

const corsOptions = {                         // Only allow requests from trusted domains.
    origin: 'http://yourfrontenddomain.com',  // Replace with your actual frontend domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,                 // 15 minutes
    max: 100,                                 // limit each IP to 100 requests per windowMs
});

//app.use(cors(corsOptions));                   // Use cors middleware
app.use(cors());
app.use(bodyParser.json());                   // Use bodyParser middleware to parse JSON requests
app.use(bodyParser.urlencoded({extended: true}));
app.use(helmet());
app.use(limiter);                             // 'express-rate-limit' lib

/* POOL CREATION *///////////////////////////////////////////////////////////
const pool = createPool({
    host:       '87.197.128.199',             // Also can be 'localhost' (then change port to 3307)
    database:   'charon',
    user:       'charonappMP',                // Username to connect charon database
    password:   'cH!0948380802!Ch',           // Password to connect charon database
    port:       3306,                         // Replace with your actual port number
    waitForConnections: true,
    connectionLimit: 100,                     // Adjust as needed
    queueLimit: 0,
})
const promisePool = pool.promise();

/* CUSTOM FUNCTIONS *////////////////////////////////////////////////////////
app.GenerateSalt = function(password) {
  const salt =  bcrypt.genSaltSync(saltRounds);  // Generate a salt
  const hashedPassword = bcrypt.hashSync(password, salt); // Hash the user's password with the generated salt
  return hashedPassword;
}

app.myQuery = async function(qry,arg){
  console.log("Qry:",qry);
  try {
    const [rows,flds] = await promisePool.query(qry,arg);
    return {success:true, data:rows};
  }
  catch(error){
    return {success:false, error:error};
  }
}

/* SIGN UP */////////////////////////////////////////////////////////////////
app.post('/sign_up', [
  check('email').isEmail(),
], async (req, res) => {
  
  var { email, password } = req.body;

  const errors = validationResult(req);       // Check for the errors in validation from 'express-validator'
  if (!errors.isEmpty()) {
    
    return res.json({ success: false, error:{message: "This is not a valid email.",code: "ER_NOTVAL_EMAIL"                                                                             }});
  }

  const hashedPassword = app.GenerateSalt(password); // Hash user password using bcrypt
  
  const result = await app.myQuery('insert users(name,email,psw,dt_signin) values (?,?,?,now())',[email,email,hashedPassword]);
  if(result.success){
    return res.json(result);
  }
  else{
    if(result.error.code == "ER_DUP_ENTRY"){
      return res.json({ success: false, error:{message: "User already exists.",code: result.error.code }});
    }
    else{
      
      return res.json({ success: false, error:{message: "Database error: ",code: result.error.code}});
    }
  }

});

/* LOGIN *///////////////////////////////////////////////////////////////////
app.post('/login', async (req, res) => {

  var { email, password } = req.body;

  const result = await app.myQuery('select id,email,cast(psw as char) psw from users where email=?',
  [email]); 

  const storedHashedPassword = result.data[0]?.psw; // Replace with the hashed password from your database
  if(!storedHashedPassword){                     // In this case storedHashedPassword is undefined and that means email was not found in db
    return res.json({ success: false, error:{message: "Incorrect email or password."} });
  }
  const user_id = result.data[0]?.id; // We will use this identifier further in program when we will be saving and loading dashboards that this user want

  // Compare the provided password with the stored hashed password
  bcrypt.compare(password, storedHashedPassword, (err, b_result) => {
    
    if (b_result){
      return res.json({ success: true, data:{id: user_id} });
    }
    else{
      return res.json({ success: false, error:{message: "Incorrect email or password."} });
    }
  
  });
});

/* DASHBOARD SAVE *///////////////////////////////////////////////////////////////////
app.post('/dashboard_save',async (req,res) => {

  const d=req.body; 
  let result;

  if (d.dashid==0) {
    result = await app.myQuery('insert dashboards(uid,name,description,body,dt_mdf) values(?,?,?,?,now())',
    [d.userid, d.dashname, d.dashdesc, d.dashdata ],res)
  } else if (d.dashdata==undefined)
    result = await app.myQuery('update dashboards set name=?,description=? where id=? and uid=?',
    [d.dashname, d.dashdesc, d.dashid, d.userid],res)
    else
    result = await app.myQuery('update dashboards set name=?,description=?,body=?,dt_mdf=now() where id=? and uid=?',
    [d.dashname, d.dashdesc, d.dashdata, d.dashid, d.userid],res);
    
    
    return res.json({ success: true, data:result.data });
  });
  
/* DASHBOARD LIST *///////////////////////////////////////////////////////////////////
app.post('/dashboard_list',async (req, res) => {
  
  const result = await app.myQuery('select id dashid,name dashname,description dashdesc,dt_mdf dashdt from dashboards where uid=?', 
  [req.body.userid],res); 
  return res.json({ success: true, data:result.data });
  
});
/* DASHBOARD DELETE *///////////////////////////////////////////////////////////////////
app.post('/dashboard_delete',async (req,res)=> {

  const result = await app.myQuery('delete from dashboards where id=? and uid=?', 
  [req.body.dashid,req.body.userid],res); 
  return res.json({ success: true, data:result.data });
});


/* DASHBOARD OPEN *///////////////////////////////////////////////////////////////////
app.post('/dashboard_open', (req,res) => {
  
  app.myQuery(
    'select id dashid,name dashname,description dashdesc,body dashdata,dt_mdf dashdt '+
    'from dashboards where id=? and uid=?',
  [req.body.dashid,req.body.userid],res);
    
})
  
  


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
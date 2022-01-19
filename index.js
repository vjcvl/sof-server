const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const app = express();
app.use(express.json());
const bcrypt = require("bcryptjs");
const URL = "mongodb+srv://vijayakumar:<sasi@12345>@cluster0.4eb06.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
app.use(cors({origin: "*"}))
const secret = "gQ42272T957F65x8";

let authenticate = (req,res,next)=>{
    if(req.headers.authorization){
       let result = jwt.verify(req.headers.authorization,secret);
       if(result){
           next();
       }else{
           res.status(401).json({message : "Time out"})
       }
    }else{
        res.status(401).json({message : "not found"})
    }
}
app.post("/register", async (req, res) => {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("stackover");
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash
        await db.collection("users").insertOne(req.body);
        connection.close();
        res.json({message: "done"})
    } catch (error) {
        console.error(error);
    }
})
app.post("/login", async (req, res) => {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("stackover");
        let user = await db.collection("users").findOne({email : req.body.email});
        if(user){
             let result = await bcrypt.compare(req.body.password,user.password);
             if(result){
                let token = jwt.sign({ userid: user._id }, secret,{expiresIn : '1h'});
                res.json({token});
             }else{
                 res.status(401).json({message : "Email Id or Password is not correct"})
             }
        }else{
            res.status(401).json({message : "Email Id or Password is not correct"})
        }
        connection.close();
    } catch (error) {console.error(error);}
})
app.post("/posts",authenticate,async(req,res)=>{
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("stackover");
        await db.collection("posts").insertOne(req.body);
        
        connection.close();
        res.json({message : "Posted"})
        
    } catch (error) {
      console.error(error);  
    }
    })

app.listen(process.env.PORT || 3000);

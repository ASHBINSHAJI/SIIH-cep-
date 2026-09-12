var express = require('express');
var router = express.Router();
const bcrypt=require('bcrypt')
const db=require('../config/connection')
const collection =require('../config/collection')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{student:true});
});
router.get('/program',(req,res,next)=>{
  const facts = [
    { value: '36', label: 'HOURS' },
    { value: '01', label: 'NATIONAL EVENT' },
    { value: '∞', label: 'POSSIBILITIES' },
    { value: '01', label: 'MISSION' }
  ];
  res.render('program',{student:true, facts})
})
router.get('/login',(req,res,next)=>{
  res.render('studenter',{student:true})
})

router.get('/team/login',(req,res,next)=>{
  res.redirect('/dashboardlogin')
})

// router.get('/status/:id',async(req,res,next)=>{
//   try {
//     const database=await db.get()
//     const {ObjectId}=require('mongodb')
//     const team =await database.collection(collection.TEAM_COLLECTIONS).findOne({_id: new ObjectId(req.params.id)});
//   res.json({status:team? team.status:'pending'});
//   } catch (err) {
//     console.log("status check error",err);
//     res.status(500).json({status:'error'})

//   }
// })
// router.post('/team-confirmation',async(req,res,next)=>{

//   try{
//     console.log(req.body);
// const database= await db.get()
// const teamData = {...req.body,status:"pending"}
// await
// database.collection(collection.TEAM_COLLECTIONS).insertOne(teamData)
// res.send(`
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">

//     <title>SIIH | Application Submitted</title>

//     <style>
//         * {
//             box-sizing: border-box;
//         }

//         body {
//             margin: 0;
//             min-height: 100vh;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             padding: 20px;

//             font-family: Arial, sans-serif;

//             background: #08090f;
//             color: white;
//         }

//         .card {
//             width: 100%;
//             max-width: 500px;

//             padding: 40px 30px;

//             text-align: center;

//             background: #11121a;
//             border: 1px solid #292a36;
//             border-radius: 24px;

//             box-shadow: 0 20px 60px rgba(0,0,0,0.4);
//         }

//         .logo {
//             font-size: 14px;
//             font-weight: bold;
//             letter-spacing: 3px;
//             color: #aaa;
//             margin-bottom: 35px;
//         }

//         .logo span {
//             color: #3f36e7;
//         }

//         .loader {
//             width: 65px;
//             height: 65px;

//             margin: 0 auto 25px;

//             border: 4px solid #292a36;
//             border-top: 4px solid #3f36e7;

//             border-radius: 50%;

//             animation: spin 1s linear infinite;
//         }

//         @keyframes spin {
//             100% {
//                 transform: rotate(360deg);
//             }
//         }

//         h1 {
//             margin-bottom: 12px;
//             font-size: 30px;
//         }

//         p {
//             color: #999ba8;
//             line-height: 1.6;
//             font-size: 15px;
//         }

//         .status {
//             margin-top: 30px;

//             padding: 15px;

//             background: #171824;
//             border: 1px solid #292a36;

//             border-radius: 14px;

//             display: flex;
//             align-items: center;
//             gap: 12px;

//             text-align: left;
//         }

//         .dot {
//             width: 10px;
//             height: 10px;

//             flex-shrink: 0;

//             background: #3f36e7;
//             border-radius: 50%;

//             box-shadow: 0 0 12px #3f36e7;

//             animation: pulse 1.5s infinite;
//         }

//         @keyframes pulse {
//             50% {
//                 opacity: 0.3;
//             }
//         }

//         .status strong {
//             display: block;
//             font-size: 14px;
//         }

//         .status small {
//             color: #777986;
//         }

//         .footer {
//             margin-top: 25px;
//             font-size: 12px;
//             color: #5f606b;
//         }
//     </style>
// </head>

// <body>

//     <div class="card">

//         <div class="logo">
//             SIIH <span>•</span> HACKATHON
//         </div>

//         <div class="loader"></div>

//         <h1>Application Under Review</h1>

//         <p>
//             Your request has been successfully submitted.
//             Our admin team is reviewing your application.
//         </p>

//         <div class="status">

//             <div class="dot"></div>

//             <div>
//                 <strong>Waiting for approval</strong>
//                 <small>This page updates automatically.</small>
//             </div>

//         </div>

//         <div class="footer">
//             Please keep this page open.
//         </div>

//     </div>


//     <script>

//         const teamid = "${teamData._id}";

//         async function checkStatus() {

//             try {

//                 const response = await fetch("/status/" + teamid);

//                 const data = await response.json();

//                 console.log("Current status:", data.status);

//                 if (data.status === "approved") {

//                     window.location.href = "/approved/" + teamid;

//                 }

//                 if (data.status === "rejected") {

//                     window.location.href = "/rejected";

//                 }

//             } catch (error) {

//                 console.error("Status check failed:", error);

//             }

//         }

//         checkStatus();

//         setInterval(checkStatus, 3000);

//     </script>

// </body>
// </html>
// `);
//   }
//   catch(err){
// console.log("database",err);
// res.status(500).send('Reg failed')
//   }
// })
// // router.get('/approved/:id',async(req,res,next)=>{
// // try {
// //   const{ObjectId}=require('mongodb')
// //   console.log("approved setion started");
// //   const database=await db.get()
// //   const team=await database.collection(collection.TEAM_COLLECTIONS).findOne({
// //     _id: new ObjectId(req.params.id),
// //     status:"approved"
// //   })
// //   if(!team){
// //     return  res.redirect('/team/conformation');
// //   }
// //   res.render('approved',{team,student:true});
// //   console.log("approved passed to rewnder");

// // } catch (err) {
// //  console.log("approved error",err);
// //  res.status(500).send("error")
// // }
// // })
// router.get('/dashboardlogin',(req,res,next)=>{
//   res.render('studenter',{student:true})
// })
// router.post('/login',async(req,res,next)=>{
//   try {
//     const database=await db.get()
//     const team=await database.collection(collection.TEAM_COLLECTIONS).findOne({
//       teamid: req.body.teamid,
//       status:"approved"
//     });
//     if(!team){
//       return res.status(401).send("Invaild id")

//     }
//     const  passwordMatch=await bcrypt.compare(
//       req.body.password,
//       team.password
//     );
//     if(!passwordMatch){
//       return res.status(401).send("invaild team id or pass")
//     }
//   req.session.teamid=team.teamid;
//   req.session.teamMongoid=team.id;
//   console.log(team.teamid);

//   res.redirect('/teamview')
//   } catch (err) {
//     console.log(err);
//     res.status(500).send("login failed");

//   }
// })
module.exports = router;

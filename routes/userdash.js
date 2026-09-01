const express=require('express')
const path= require('path')
var router = express.Router()
const db = require('../config/connection');
const collection=require('../config/collection')
const bcrypt=require('bcrypt')

router.get('/dashboardlogin',(req,res,next)=>{
  res.render('studenter',{student:true});
});

router.post('/dashboardlogin',async(req,res,next)=>{
  try{
    const {teamid,password}=req.body;
    if(!teamid || !password){
      return res.render('studenter',{error:'Team ID and password required',student:true});
    }
    const database= await db.get();
    const team=await database.collection(collection.TEAM_COLLECTIONS).findOne({teamid:teamid});
    if(!team){
      return res.render('studenter',{error:'Team not found',student:true});
    }
    const passwordMatch=await bcrypt.compare(password,team.password);
    if(!passwordMatch){
      return res.render('studenter',{error:'Invalid password',student:true});
    }
    req.session.teamid=teamid;
    res.redirect('/teamview');
  }catch(err){
    console.log('Dashboard login error',err);
    res.status(500).send('Login failed');
  }
});

 router.get('/teamview',async(req,res,next)=>{
    try{
        if(!req.session.teamid){
            return res.redirect('/dashboardlogin')
        }
        const database= await db.get()
      
        const teams=await database.collection(collection.TEAM_COLLECTIONS).find({
            teamid:req.session.teamid,
            status:"approved"

        }).toArray()
        if(!teams || teams.length === 0){
return res.status(404).send("Team is not found");
        }
        const  admtask=await database.collection(collection.GAVE_TASK).find({}).sort({_id:-1}).limit(1).toArray()
        console.log("ADM TASK:",admtask); 
        console.log("user dash is okay working");
        res.render('teamview',{admtask,teams,student:true})
    }
   catch(err){
console.log("user dash is err",err);
res.status(500).send('failed')
   }
 })

module.exports=router;

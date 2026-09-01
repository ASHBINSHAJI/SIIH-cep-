const { MongoClient }=require('mongodb');
require('dotenv').config();
const state={
db:null,
}
module.exports.connect=function(done){
    const dbPassword=process.env.DB_PASSWORD || '<db_password>';
    const url = `mongodb://ashbinshaji20088_db_user:${dbPassword}@ac-swqdy4r-shard-00-00.kk65zx8.mongodb.net:27017,ac-swqdy4r-shard-00-01.kk65zx8.mongodb.net:27017,ac-swqdy4r-shard-00-02.kk65zx8.mongodb.net:27017/?ssl=true&replicaSet=atlas-d1rnyv-shard-0&authSource=admin&appName=Cluster0`;
    const dbname="cep";
console.log("Trying to connect..");
console.log("Connection URL:", url.replace(dbPassword, '****'));
MongoClient.connect(url)
.then((client)=>{
    console.log("mongodb connected");
    state.db=client.db(dbname)
    done()
    
})
.catch((err)=>{
    console.log("mongo Connection err");
    console.log("dberror",err);
    done(err);
    
    
})
}
module.exports.get=function () {
    return state.db;
}

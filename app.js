const express = require('express');
const path = require('path');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const mongoose = requier('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();

// middwares
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// mongo ui
const mongoURI = process.env.MONGO_URL;

// create mongo connection
const conn = mongoose.creatConnection(mongoURI);

// Init gfs
let gfs;

conn.once('open', ()=>{
    // init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
}) 

// create storage engine

app.get('/', (req,res)=>{
    res.render('index');
})

const port = 5000;

app.listen(port, ()=> console.log(`server is running : ${port}`));
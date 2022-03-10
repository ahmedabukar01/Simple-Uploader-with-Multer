const express = require('express');
const path = require('path');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();

// middwares
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// mongo ui
const mongoURL = process.env.MONGO_URL;

// create mongo connection
const conn = mongoose.createConnection(mongoURL);

// Init gfs
let gfs;

conn.once('open', ()=>{
    // init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
}) 

// create storage engine
const storage = new GridFsStorage({
    url: mongoURL,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });

// @route GET /upload
// @desc loads form
app.get('/', (req,res)=>{
    res.render('index');
})

// @route POST /upload
// @desc Uploads file to db
app.post('/upload',upload.single('file'), (req,res)=>{
    res.json({file : req.file})
})

// get all images
app.get('/files',(req,res)=>{
    gfs.files.find().toArray((err,files)=>{
        if(!files){
            return res.status(404).json({err: 'no data'})
        }

        // file exist
         res.json(files)
    })
})

// get single image
app.get('/files/:filename',(req,res)=>{
    gfs.files.findOne({filename: req.params.filename}), (err,file)=>{
        if(!file || file.length === 0){
            return res.status(404).json({err: 'no data'})
        }

        // file exist
         res.json(file)
    }
})
// display single image
app.get('/images/:filename',(req,res)=>{
    gfs.files.findOne({filename: req.params.filename}), (err,file)=>{
        if(!file || file.length === 0){
            return res.status(404).json({err: 'no data'})
        }

        // check
        if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
            //read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res)
        } else{
            res.status(404).json({err: 'not an image'})
        }
         
    }
})

const port = 5000;

app.listen(port, ()=> console.log(`server is running : ${port}`));
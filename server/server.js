const morgan = require('morgan');
const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const knex = require('knex');

// Create database object
const db = knex({
  client: 'pg',
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: 'root',
    database: 'ethiotweetercamp',
    port: 5432,
  },
});

// Set middlewares
app.use(express.json());
app.use(morgan('dev'));


// Create multer object
// AFTER : Create multer object
const imageUpload = multer({
    storage: multer.diskStorage(
        {
            destination: function (req, file, cb) {
                cb(null, 'images/');
            },
            filename: function (req, file, cb) {
                cb(
                    null,
                    new Date().valueOf() + 
                    '_' +
                    file.originalname
                );
            }
        }
    ), 
});

// @TODO Add routes
// Image Upload Routes
app.post('/image', imageUpload.single('image'), (req, res) => { 
    // console.log(req.file);
    console.log(req.file)
    res.json('/image api');
    
    const { filename, mimetype, size } = req.file;
    const filepath = req.file.path;

    db.insert({ filename, filepath, mimetype, size, })
        .into('image_files')
        .then(() => res.json({ success: true, filename }))
        .catch(err => res.json({ success: false,message: 'upload failed',stack: err.stack,}));

});

// Image Get Routes
app.get('/image/:filename', (req, res) => {
    const { filename } = req.params;
    db.select('*').from('image_files').where({ filename })
        .then(images => {
            if (images[0]) {
                const dirname = path.resolve();
                const fullfilepath = path.join(dirname, images[0].filepath);
                return res.type(images[0].mimetype).sendFile(fullfilepath);
            }
            return Promise.reject(
                new Error('Image does not exist')
            );
        }).catch(err => res.status(404).json({ success: false, message: 'not found', stack: err.stack, }),
    );  
});

app.listen(5000, () => {
    console.log(`app is running on port 5000`);
});
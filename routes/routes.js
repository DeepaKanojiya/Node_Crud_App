const express = require("express");
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require("fs");

// Image uploading
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

const upload = multer({
    storage: storage
}).single("image");

// Insert a user in the database route
router.post("/add", upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename
    });

    user.save()
        .then(() => {
            req.session.message = {
                type: 'success',
                message: 'User added successfully!'
            };
            res.redirect('/');
            console.log("Image Added");
        })
        .catch((err) => {
            res.json({ message: err.message, type: 'danger' });
        });
});

// Get all users route
router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.render("index", {
            title: "Home Page",
            users: users,
            message: req.session.message || null, // Pass message or null if not set
        });
        delete req.session.message; // Clear the message after it's used
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});


router.get("/add", (req, res) => {
    res.render("add_user", { title: "Add Users" });
});

//Edit an user route
// Assuming you have the necessary imports and setup

router.get('/edit/:id', async (req, res) => {
    try {
      let id = req.params.id;
      let user = await User.findById(id);
  
      if (!user) {
        res.redirect('/');
      } else {
        res.render('edit_users', {
          title: 'Edit User',
          user: user,
        });
      }
    } catch (err) {
      console.error('Error finding user:', err);
      res.redirect('/');
    }
  });
  
//update user route
router.post('/update/:id' ,upload,async (req,res)=>{
    let id=req.params.id;
    let new_image="";

    if (req.file) {
        new_image=req.file.filename;
        try {
            fs.unlinkSync("./uploads/" + req.body.old_image)
        } catch (err) {
            console.log(err);
        }
    }else{
        new_image = req.body.old_image
    }

    try {
        const result = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        }, { new: true });
    
        req.session.message = {
            type: 'success',
            message: 'User updated successfully!',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
    
});

// Delete user route
router.get('/delete/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await User.findByIdAndDelete(id);

        if (result.image !== '') {
            try {
                fs.unlinkSync(`./uploads/${result.image}`);
            } catch (err) {
                console.log(err);
            }
        }

        req.session.message = {
            type: 'info',
            message: 'User deleted successfully',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message });
    }
});


module.exports = router;
 
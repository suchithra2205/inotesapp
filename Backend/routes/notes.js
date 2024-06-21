const express = require('express');
const router = express.Router();
const fetchuser = require('../middileware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

// ROUTE:1 get all the notes using: GET "/api/notes/fetchallnotes".Doesn't require auth
router.get('/fetchallnotes',fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(" internal server  error occured");
    }
})
// ROUTE:2 add a new note using: POST "/api/notes/addnote".Doesn't require auth
router.post('/addnote', fetchuser, [
    body('title', 'enter a valid title').isLength({ min: 3 }),
    body('description', 'description must be atleast 5 characters').isLength({ min: 5 }),

], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        const savednote = await note.save()
        res.json(savednote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(" internal server  error occured");
    }
})
// ROUTE:3 update an exsisting note using: PUt "/api/notes/updatenote". require auth
router.put('/updatenote/:id', fetchuser, 
     async (req, res) => {
        const {title,description,tag}=req.body;
        // create a new note3s
        const newnote={};
        if(title){newnote.title=title};
        if(description){newnote.description=description};
        if(tag){newnote.tag=tag};

        // find the note to be updated and update it
        let note = await Notes.findById(req.params.id);
        if(!note){res.status(404).send("Not found")}
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not allowed")
        }
        note= await Notes.findByIdAndUpdate(req.params.id,{$set:newnote},{new:true})
        res.json(note);
}) 
// ROUTE:4 delete an exsisting note using: DELETE "/api/notes/deletenote". require auth

router.delete('/deletenote/:id', fetchuser, 
    async (req, res) => {
      
      try {
          // find the note to be deleted and delete it
       let note = await Notes.findById(req.params.id);
       if(!note){ return res.status(404).send("Not found")};
       console.log(`Note found: ${note}`);
       console.log(`User trying to delete note: ${req.user.id}`);
       // allow user to delete the note if user owns this Note
       if(note.user.toString() !== req.user.id){
           return res.status(401).send("Not allowed")
       }
        await Notes.findByIdAndDelete(req.params.id)
       return res.json({"Success":"Note has been deleted",note:note});
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
      }
    })
module.exports = router
const express = require("express");
const { getNotes, createNote, updateNote, deleteNote } = require("../controllers/noteController");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// Every route below requires a logged-in user
router.use(requireAuth);

router.get("/", getNotes);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

module.exports = router;

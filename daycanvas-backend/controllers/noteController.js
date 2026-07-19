const Note = require("../models/Note");

// GET /api/notes — returns every note belonging to the logged-in user
async function getNotes(req, res) {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({ createdAt: 1 });
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ message: "Could not load notes.", error: err.message });
  }
}

// POST /api/notes — create a note for the logged-in user
async function createNote(req, res) {
  try {
    const { dateKey, ...rest } = req.body;
    if (!dateKey) {
      return res.status(400).json({ message: "dateKey is required (e.g. '2026-07-19')." });
    }

    const note = await Note.create({ userId: req.userId, dateKey, ...rest });
    res.status(201).json({ note });
  } catch (err) {
    res.status(500).json({ message: "Could not create note.", error: err.message });
  }
}

// PUT /api/notes/:id — update a note, only if it belongs to the logged-in user
async function updateNote(req, res) {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }
    res.json({ note });
  } catch (err) {
    res.status(500).json({ message: "Could not update note.", error: err.message });
  }
}

// DELETE /api/notes/:id — delete a note, only if it belongs to the logged-in user
async function deleteNote(req, res) {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }
    res.json({ message: "Note deleted.", note });
  } catch (err) {
    res.status(500).json({ message: "Could not delete note.", error: err.message });
  }
}

module.exports = { getNotes, createNote, updateNote, deleteNote };

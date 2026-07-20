const express = require("express");
const { getHolidays } = require("../controllers/holidayController");

const router = express.Router();

// Public — no login required, since holiday data isn't user-specific
router.get("/", getHolidays);

module.exports = router;
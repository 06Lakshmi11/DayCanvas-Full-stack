async function getHolidays(req, res) {
  try {
    const { country, year } = req.query;
    if (!country || !year) {
      return res.status(400).json({ message: "country and year are required." });
    }

    const apiKey = process.env.CALENDARIFIC_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Server is missing CALENDARIFIC_KEY." });
    }

    const url = `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=${country}&year=${year}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data?.meta?.code !== 200) {
      return res.status(502).json({
        message: data?.meta?.error_detail || "Could not load holidays.",
      });
    }

    const holidays = (data?.response?.holidays || []).map((h) => ({
      date: h.date.iso.slice(0, 10),
      name: h.name,
    }));

    res.json({ holidays });
  } catch (err) {
    res.status(500).json({ message: "Could not load holidays.", error: err.message });
  }
}

module.exports = { getHolidays };
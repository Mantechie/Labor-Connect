import Report from '../models/Report.js';

// POST /api/support/report
export const submitReport = async (req, res) => {
  try {
    const { name, email, type, message, referenceId } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const report = new Report({ name, email, type, message, referenceId });
    await report.save();
    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit report' });
  }
}; 
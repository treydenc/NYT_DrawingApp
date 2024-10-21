// pages/api/upload-phrases.js
import { read, utils } from 'xlsx';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing so we can handle the file upload
  },
};

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form' });
    }

    // Read the Excel file
    const filePath = files.file.filepath;
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = read(fileBuffer, { type: 'buffer' });

    // Assume the phrases are in the first sheet, first column
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const phrases = utils.sheet_to_json(worksheet, { header: 1 }).flat();

    res.status(200).json({ phrases });
  });
}

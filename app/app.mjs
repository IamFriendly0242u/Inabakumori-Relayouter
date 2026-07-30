/* ==========================================================================
   1. MODULE IMPORTS & DIRECTORY CONFIG
   ========================================================================== */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const directoryPath = path.join(__dirname, "../assets");

const fileNames = [];


/* ==========================================================================
   2. DIRECTORY READER LOGIC
   ========================================================================== */

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  files.forEach((file) => {
    fileNames.push(file);
  });

  console.log('File names:', fileNames);
});
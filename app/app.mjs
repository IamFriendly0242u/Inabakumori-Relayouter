/* ==========================================================================
   1. MODULE IMPORTS & DIRECTORY CONFIG
   ========================================================================== */

import fs from "fs";

const directoryPath = 'C:/Program Files (x86)/Steam/steamapps/common/wallpaper_engine/projects/myprojects/index1/assets';

// Array to store file names
const fileNames = [];


/* ==========================================================================
   2. DIRECTORY READER LOGIC
   ========================================================================== */

// Read the contents of the directory
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  // Loop through each file and add its name to the array
  files.forEach((file) => {
    fileNames.push(file);
  });

  // Output the array of file names
  console.log('File names:', fileNames);
});

// just to get file names very inefficient but eh
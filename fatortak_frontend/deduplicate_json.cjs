const fs = require('fs');
const path = require('path');

function deduplicateJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Using JSON.parse will automatically pick the last occurrence of a duplicate key
    const data = JSON.parse(content);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Successfully deduplicated and formatted ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

const enPath = path.join(__dirname, 'public', 'locale', 'en', 'translation.json');
const arPath = path.join(__dirname, 'public', 'locale', 'ar', 'translation.json');

deduplicateJson(enPath);
deduplicateJson(arPath);

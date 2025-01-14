const fs = require('fs');
const path = require('path');
const axios = require('axios');

const urlsPath = path.join(__dirname, 'public', 'assets', 'data', 'dataset-urls.json');

fs.readFile(urlsPath, 'utf-8', (err, data) => {
  if (err) {
    console.error(`Error al leer dataset-urls.json: ${err.message}`);
    return;
  }

  const urls = JSON.parse(data);

  urls.forEach(urlObj => {
    const fullUrl = urlObj.url;

    axios.get(fullUrl)
      .then(response => {
        console.log(`URL válida: ${fullUrl}`);
      })
      .catch(error => {
        console.log(`URL rota: ${fullUrl} (${error.message})`);
      });
  });
});

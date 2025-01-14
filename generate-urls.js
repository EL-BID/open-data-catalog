const fs = require('fs');
const path = require('path');

const metadataPath = path.join(__dirname, 'public', 'assets', 'data', 'metadata.json');
const outputPath = path.join(__dirname, 'public', 'assets', 'data', 'dataset-urls.json');

const baseDomain = 'https://mydata.iadb.org';

function generateDatasetRoute(mydata_category, title_original) {
  const formattedCategory = mydata_category ? mydata_category.toLowerCase() : '';
  const formattedTitle = title_original
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
    .replace(/-+$/g, '');

  if (formattedCategory) {
    return `${baseDomain}/${formattedCategory}/${formattedTitle}`;
  }
  return `${baseDomain}/dataset/${formattedTitle}`;
}

fs.readFile(metadataPath, 'utf-8', (err, data) => {
  if (err) {
    console.error(`Error al leer metadata.json: ${err.message}`);
    return;
  }

  const datasets = JSON.parse(data);
  const urls = datasets.map(dataset => ({
    id: dataset.id,
    mydata_category: dataset.mydata_category,
    title: dataset.title,
    title_original: dataset.title_original,
    url: generateDatasetRoute(dataset.mydata_category, dataset.title_original),
  }));

  fs.writeFile(outputPath, JSON.stringify(urls, null, 2), 'utf-8', (err) => {
    if (err) {
      console.error(`Error al guardar dataset-urls.json: ${err.message}`);
    } else {
      console.log(`Archivo dataset-urls.json generado en: ${outputPath}`);
    }
  });
});

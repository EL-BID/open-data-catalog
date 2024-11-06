document.addEventListener("DOMContentLoaded", function() {
  const datasetList = document.getElementById('datasetList');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const yearFilter = document.getElementById('yearFilter');
  const pagination = document.getElementById('pagination');
  const resultsCount = document.getElementById('resultsCount');

  setupMoreLessButtons(); // Call this function after setting up event listeners

  let datasets = [];
  let currentPage = 1;
  const datasetsPerPage = 10;

  // Fetch the dataset JSON file
  fetch('datasets.json')
    .then(response => response.json())
    .then(data => {
      datasets = data;
      updateDisplay();  // Initial display of datasets
      setupEventListeners();
    })
    .catch(error => {
      console.error('Error fetching datasets:', error);
      datasetList.innerHTML = '<p>Error loading datasets. Please try again later.</p>';
    });

  function setupEventListeners() {
    // Event listener for search input
    searchInput.addEventListener('input', function() {
      currentPage = 1; // Reset to first page on search
      updateDisplay();
    });

    // Event listeners for filters
    categoryFilter.addEventListener('change', function() {
      currentPage = 1; // Reset to first page on filter change
      updateDisplay();
    });

    yearFilter.addEventListener('change', function() {
      currentPage = 1; // Reset to first page on filter change
      updateDisplay();
    });
  }

  function updateDisplay() {
    const filteredDatasets = filterDatasets();
    const paginatedDatasets = paginateDatasets(filteredDatasets);
    displayDatasets(paginatedDatasets, filteredDatasets.length);
    setupPagination(filteredDatasets.length);
  }

  // Function to filter datasets based on search and filters
  function filterDatasets() {
    const searchTerm = searchInput.value.toLowerCase();

    // Get selected categories
    const selectedCategories = Array.from(categoryFilter.querySelectorAll('input[type="checkbox"]:checked'))
      .map(cb => cb.value.toLowerCase());

    // Get selected years
    const selectedYears = Array.from(yearFilter.querySelectorAll('input[type="checkbox"]:checked'))
      .map(cb => parseInt(cb.value));

    return datasets.filter(dataset => {
      // Search term matching
      const matchesSearch = dataset.title.toLowerCase().includes(searchTerm) ||
        dataset.description.toLowerCase().includes(searchTerm) ||
        dataset.tags.some(tag => tag.toLowerCase().includes(searchTerm));

      // Category matching
      const matchesCategory = selectedCategories.length === 0 ||
        selectedCategories.some(category => dataset.categories.map(c => c.toLowerCase()).includes(category));

      // Year matching
      const matchesYear = selectedYears.length === 0 ||
        selectedYears.includes(dataset.year);

      return matchesSearch && matchesCategory && matchesYear;
    });
  }

  // Function to paginate datasets
  function paginateDatasets(filteredDatasets) {
    const startIndex = (currentPage - 1) * datasetsPerPage;
    const endIndex = startIndex + datasetsPerPage;
    return filteredDatasets.slice(startIndex, endIndex);
  }

  // Function to display datasets in the DOM
  function displayDatasets(datasetsToDisplay, totalResults) {
    datasetList.innerHTML = '';  // Clear previous results

    // Update results count
    resultsCount.textContent = `${totalResults} Result${totalResults !== 1 ? 's' : ''}`;

    if (datasetsToDisplay.length === 0) {
      datasetList.innerHTML = '<p>No datasets found.</p>';
      pagination.innerHTML = ''; // Clear pagination if no results
      return;
    }

    datasetsToDisplay.forEach(dataset => {
      const datasetItem = document.createElement('div');
      datasetItem.classList.add('dataset-item');

      // Prepare the categories as pills
      const categoriesHTML = dataset.categories.map(category => `<span class="category-pill">${category}</span>`).join('');

      // Prepare regional coverage (max 4 countries + X more)
      const countries = dataset.regional_coverage.slice(0, 4).join(', ');
      const moreCountries = dataset.regional_coverage.length > 4 ? ` + ${dataset.regional_coverage.length - 4} others` : '';

      // Create the dataset info section
      const datasetInfo = `
        <div class="dataset-info">
          <h3>${dataset.title}</h3>
          <p class="by-line">By <strong>${dataset.sector}</strong></p>
          <div class="dataset-categories">${categoriesHTML}</div>
          <p class="metadata-item">Regional Coverage: <strong>${countries}${moreCountries}</strong></p>
          <p class="metadata-item">Temporal Coverage: <strong>${dataset.temporal_coverage}</strong></p>
          <p class="metadata-item">Available Formats: <strong>${dataset.available_formats.join(', ')}</strong></p>
          <a href="${dataset.url}" target="_blank" class="dataset-link">Learn more →</a>
        </div>
      `;

      // Create the metadata sidebar
      const metadataSidebar = `
      <div class="metadata-sidebar">
        <h4>RELEVANT METADATA</h4>
        <p><span class="check-icon">✔</span> ${dataset.updates}</p>
        <p><span class="check-icon">✔</span> ${dataset.part_of_series}</p>
        <p><span class="check-icon">✔</span> ${dataset.connection_with_other_products}</p>
      </div>
    `;

      // Combine the dataset info and metadata sidebar
      datasetItem.innerHTML = datasetInfo + metadataSidebar;

      datasetList.appendChild(datasetItem);
    });
  }

  // Function to setup pagination controls
  function setupPagination(totalDatasets) {
    pagination.innerHTML = ''; // Clear existing pagination

    const totalPages = Math.ceil(totalDatasets / datasetsPerPage);
    if (totalPages <= 1) return; // No need for pagination if only one page

    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;

      if (i === currentPage) {
        pageButton.classList.add('active');
      }

      pageButton.addEventListener('click', function() {
        currentPage = i;
        updateDisplay();
      });

      pagination.appendChild(pageButton);
    }
  }

  // Function to set up the More/Less buttons
  function setupMoreLessButtons() {
    const moreLessButtons = document.querySelectorAll('.more-less-button');

    moreLessButtons.forEach(button => {
      button.addEventListener('click', function() {
        const filterOptions = this.parentElement;
        const hiddenOptions = filterOptions.querySelector('.filter-options-hidden');

        if (hiddenOptions.style.display === 'none') {
          hiddenOptions.style.display = 'flex';
          this.textContent = 'Less';
        } else {
          hiddenOptions.style.display = 'none';
          this.textContent = 'More';
        }
      });
    });
  }

});

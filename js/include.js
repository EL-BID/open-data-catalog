function includeHTML() {
 const elements = document.querySelectorAll('[data-include]');
 elements.forEach((element) => {
     const file = element.getAttribute('data-include');
     fetch(file)
         .then(response => {
             if (response.ok) return response.text();
             throw new Error('Network response was not ok.');
         })
         .then(data => {
             element.innerHTML = data;
         })
         .catch(error => console.error('Error loading the file:', error));
 });
}
includeHTML();
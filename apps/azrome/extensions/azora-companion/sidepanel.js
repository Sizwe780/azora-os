// Sankofa Search - Sidepanel Logic

document.getElementById('searchBtn').addEventListener('click', () => {
    const query = document.getElementById('query').value;
    if (!query) return;

    // Send query to background script, which forwards to Native Host
    browser.runtime.sendMessage({ type: "SEARCH_SANKOFA", query: query }, (response) => {
        displayResults(response.results);
    });
});

function displayResults(results) {
    const container = document.getElementById('results');
    container.innerHTML = '';

    if (!results || results.length === 0) {
        container.innerHTML = '<p>No results found in your local index.</p>';
        return;
    }

    results.forEach(doc => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
      <a href="${doc.url}" class="result-title" target="_blank">${doc.title}</a>
      <div class="result-snippet">${doc.content}...</div>
    `;
        container.appendChild(div);
    });
}

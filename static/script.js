// Handle file upload
document.getElementById('fileInput').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('fileName').textContent = file.name;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            alert('Dataset uploaded successfully!');
            await updateDatasetList();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error uploading file: ' + error.message);
    }
});

// Update dataset dropdown
async function updateDatasetList() {
    try {
        const response = await fetch('/datasets');
        const data = await response.json();
        
        const select = document.getElementById('datasetSelect');
        select.innerHTML = '<option value="">Select a dataset</option>';
        
        if (data.datasets && data.datasets.length > 0) {
            data.datasets.forEach(dataset => {
                const option = document.createElement('option');
                option.value = dataset;
                option.textContent = dataset;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error fetching datasets:', error);
    }
}

// Process natural language query
async function processQuery() {
    const query = document.getElementById('queryInput').value.trim();
    const dataset = document.getElementById('datasetSelect').value;

    if (!query || !dataset) {
        alert('Please select a dataset and enter a query');
        return;
    }

    // Show loading state
    const button = document.querySelector('button[onclick="processQuery()"]');
    const originalText = button.textContent;
    button.innerHTML = '<span class="loading"></span> Processing...';
    button.disabled = true;

    try {
        const response = await fetch('/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                dataset_name: dataset
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            // Display SQL query
            document.getElementById('sqlQuery').textContent = data.sql_query;
            
            // Display results in a table
            const resultsDiv = document.getElementById('results');
            if (data.result && data.result.length > 0) {
                const table = document.createElement('table');
                
                // Create header
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                Object.keys(data.result[0]).forEach(key => {
                    const th = document.createElement('th');
                    th.textContent = key;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);
                
                // Create body
                const tbody = document.createElement('tbody');
                data.result.forEach(row => {
                    const tr = document.createElement('tr');
                    Object.values(row).forEach(value => {
                        const td = document.createElement('td');
                        td.textContent = value;
                        tr.appendChild(td);
                    });
                    tbody.appendChild(tr);
                });
                table.appendChild(tbody);
                
                resultsDiv.innerHTML = '';
                resultsDiv.appendChild(table);
            } else {
                resultsDiv.innerHTML = '<p>No results found</p>';
            }
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error processing query: ' + error.message);
    } finally {
        // Reset button state
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Initialize dataset list on page load
document.addEventListener('DOMContentLoaded', async () => {
    await updateDatasetList();
});

// Voice input using Web Speech API
const micBtn = document.getElementById('micBtn');
const micIcon = document.getElementById('micIcon');
const queryInput = document.getElementById('queryInput');

let recognition;
let recognizing = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = function() {
        recognizing = true;
        micBtn.classList.add('bg-red-200');
        micIcon.classList.add('text-red-600');
    };
    recognition.onend = function() {
        recognizing = false;
        micBtn.classList.remove('bg-red-200');
        micIcon.classList.remove('text-red-600');
    };
    recognition.onerror = function(event) {
        recognizing = false;
        micBtn.classList.remove('bg-red-200');
        micIcon.classList.remove('text-red-600');
        alert('Voice recognition error: ' + event.error);
    };
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        queryInput.value = transcript;
    };

    micBtn.addEventListener('click', function() {
        if (recognizing) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
} else {
    micBtn.disabled = true;
    micBtn.title = 'Voice recognition not supported in this browser.';
} 
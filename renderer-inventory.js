const { ipcRenderer } = require('electron');

function loadReels(sortBy = 'date') {
  ipcRenderer.once('reels-data', (event, reels) => {
    const tableBody = document.getElementById('reelsTableBody');
    tableBody.innerHTML = '';

    const columns = Array.from(document.querySelectorAll('.columnToggle'))
      .filter(checkbox => checkbox.checked)
      .map(cb => cb.value);

    if (reels.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 8;
      cell.textContent = '📭 No data found in reels table.';
      row.appendChild(cell);
      tableBody.appendChild(row);
      return;
    }

    reels.sort((a, b) => (a[sortBy] || '').localeCompare(b[sortBy] || ''));

    reels.forEach(reel => {
      const row = document.createElement('tr');
      Object.entries(reel).forEach(([key, value]) => {
        const cell = document.createElement('td');
        cell.className = `col-${key}`;
        cell.textContent = value;
        if (!columns.includes(key)) {
          cell.classList.add('hidden');
        }
        row.appendChild(cell);
      });
      tableBody.appendChild(row);
    });
  });

  ipcRenderer.send('get-reels');
}

function refreshData() {
  const sortBy = document.getElementById('sortBy').value;
  loadReels(sortBy);
}

window.onload = () => {
  refreshData();

  document.querySelectorAll('.columnToggle').forEach(cb => {
    cb.addEventListener('change', refreshData);
  });

  document.getElementById('sortBy').addEventListener('change', refreshData);
};

document.getElementById('reelForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = {
    date: document.getElementById('date').value,
    company: document.getElementById('company').value,
    size: parseInt(document.getElementById('size').value),
    gsm: parseInt(document.getElementById('gsm').value),
    bf: parseInt(document.getElementById('bf').value),
    weight: parseFloat(document.getElementById('weight').value),
    amount: parseInt(document.getElementById('amount').value),
    type: document.getElementById('type').value
  };

  ipcRenderer.send('add-reel', data);
  e.target.reset();
  setTimeout(refreshData, 100); // Delay to ensure DB updates before refresh
});

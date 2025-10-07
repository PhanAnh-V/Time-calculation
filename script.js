document.addEventListener('DOMContentLoaded', () => {
    // Element References
    const tableBody = document.getElementById('table-body');
    const newCategoryInput = document.getElementById('new-category-input');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const totalHoursEl = document.getElementById('total-hours');
    const remainingHoursEl = document.getElementById('remaining-hours');
    const resetBtn = document.getElementById('reset-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalText = document.getElementById('modal-text');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');

    // State
    const weekHours = 168;
    let timeData = {};
    let categoryToDelete = null;

    // --- Helper Functions ---
    function formatDecimalToTime(decimalHours) {
        const hours = Math.floor(decimalHours);
        const minutes = Math.round((decimalHours - hours) * 60);
        return `${hours}h ${minutes}m`;
    }

    // --- Data Persistence ---
    function loadData() {
        const savedData = JSON.parse(localStorage.getItem('timeDataV6'));
        timeData = savedData || {
            'Sleep': { h: 56, m: 0 },
            'Work': { h: 40, m: 0 },
        };
        renderTable();
    }

    function saveData() {
        localStorage.setItem('timeDataV6', JSON.stringify(timeData));
    }

    // --- UI Rendering ---
    function createRow(category, data) {
        const weeklyH = data.h || 0;
        const weeklyM = data.m || 0;

        const row = document.createElement('tr');
        row.dataset.category = category;
        row.innerHTML = `
            <td>${category}</td>
            <td class="time-inputs">
                <input type="number" class="hours-input" value="${weeklyH}" min="0">
                <span>h</span>
                <input type="number" class="minutes-input" value="${weeklyM}" min="0" max="59">
                <span>m</span>
            </td>
            <td><button class="delete-btn"><img src="trash-icon.svg" alt="Delete"></button></td>
        `;
        return row;
    }

    function renderTable() {
        tableBody.innerHTML = '';
        for (const category in timeData) {
            const row = createRow(category, timeData[category]);
            tableBody.appendChild(row);
        }
        updateOverallSummary();
    }

    function updateOverallSummary() {
        let totalWeeklyHours = 0;
        for (const category in timeData) {
            const item = timeData[category];
            totalWeeklyHours += (item.h || 0) + ((item.m || 0) / 60);
        }
        totalHoursEl.textContent = formatDecimalToTime(totalWeeklyHours);
        remainingHoursEl.textContent = formatDecimalToTime(weekHours - totalWeeklyHours);
    }

    // --- Event Listeners ---
    addCategoryBtn.addEventListener('click', () => {
        const newCategory = newCategoryInput.value.trim();
        if (newCategory && !timeData.hasOwnProperty(newCategory)) {
            timeData[newCategory] = { h: 0, m: 0 };
            saveData();
            renderTable(); // Re-render the whole table to include the new row
        } else if (timeData.hasOwnProperty(newCategory)) {
            alert('Category already exists!');
        }
        newCategoryInput.value = '';
    });

    newCategoryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addCategoryBtn.click(); }
    });

    tableBody.addEventListener('change', (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        const category = row.dataset.category;
        const hoursInput = row.querySelector('.hours-input');
        const minutesInput = row.querySelector('.minutes-input');

        let h = parseInt(hoursInput.value) || 0;
        let m = parseInt(minutesInput.value) || 0;

        if (h < 0) h = 0;
        if (m < 0) m = 0;
        if (m >= 60) { h += Math.floor(m / 60); m %= 60; }

        timeData[category] = { h, m };

        hoursInput.value = h;
        minutesInput.value = m;

        updateOverallSummary();
        saveData();
    });

    tableBody.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.delete-btn');
        if (deleteButton) {
            const row = e.target.closest('tr');
            categoryToDelete = row.dataset.category;
            modalText.textContent = `Are you sure you want to delete the "${categoryToDelete}" category?`;
            modalOverlay.style.display = 'flex';
        }
    });

    modalCancelBtn.addEventListener('click', () => {
        modalOverlay.style.display = 'none';
        categoryToDelete = null;
    });

    modalConfirmBtn.addEventListener('click', () => {
        delete timeData[categoryToDelete];
        saveData();
        renderTable();
        modalOverlay.style.display = 'none';
        categoryToDelete = null;
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all categories and data? This cannot be undone.')) {
            localStorage.removeItem('timeDataV6');
            location.reload();
        }
    });

    // Initial Load
    loadData();
});

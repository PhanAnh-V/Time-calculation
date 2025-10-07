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
        const savedData = JSON.parse(localStorage.getItem('timeDataV5')); // New key for new structure
        timeData = savedData || {
            'Sleep': { h: 8, m: 0, d: 7 },
            'Work': { h: 0, m: 0, d: 5 },
        };
        renderTable();
    }

    function saveData() {
        localStorage.setItem('timeDataV5', JSON.stringify(timeData));
    }

    // --- UI Rendering ---
    function createRow(category, data) {
        const dailyH = data.h || 0;
        const dailyM = data.m || 0;
        const days = data.d || 7;
        const dailyHoursDecimal = dailyH + (dailyM / 60);
        const weeklyTotal = dailyHoursDecimal * days;

        const row = document.createElement('tr');
        row.dataset.category = category;
        row.innerHTML = `
            <td>${category}</td>
            <td class="time-inputs">
                <input type="number" class="hours-input" value="${dailyH}" min="0" max="24">
                <span>h</span>
                <input type="number" class="minutes-input" value="${dailyM}" min="0" max="59">
                <span>m</span>
            </td>
            <td><input type="number" class="days-input" value="${days}" min="1" max="7"></td>
            <td class="weekly-total">${formatDecimalToTime(weeklyTotal)}</td>
            <td><button class="delete-btn">Delete</button></td>
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

    function updateOverallSummary(data) {
        let totalWeeklyHours = 0;
        const sourceData = data || timeData;
        for (const category in sourceData) {
            const item = sourceData[category];
            const dailyHoursDecimal = (item.h || 0) + ((item.m || 0) / 60);
            totalWeeklyHours += dailyHoursDecimal * (item.d || 7);
        }
        totalHoursEl.textContent = formatDecimalToTime(totalWeeklyHours);
        remainingHoursEl.textContent = formatDecimalToTime(weekHours - totalWeeklyHours);
    }

    // --- Event Listeners ---
    addCategoryBtn.addEventListener('click', () => {
        const newCategory = newCategoryInput.value.trim();
        if (newCategory && !timeData.hasOwnProperty(newCategory)) {
            timeData[newCategory] = { h: 0, m: 0, d: 7 }; // Default to 7 days
            saveData();
            const newRow = createRow(newCategory, timeData[newCategory]);
            tableBody.appendChild(newRow);
            newRow.classList.add('flash-green');
            updateOverallSummary();
        } else if (timeData.hasOwnProperty(newCategory)) {
            alert('Category already exists!');
        }
        newCategoryInput.value = '';
    });

    newCategoryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addCategoryBtn.click(); }
    });

    function updateRowCalculations(row) {
        const hoursInput = row.querySelector('.hours-input');
        const minutesInput = row.querySelector('.minutes-input');
        const daysInput = row.querySelector('.days-input');
        let h = parseInt(hoursInput.value) || 0;
        let m = parseInt(minutesInput.value) || 0;
        let d = parseInt(daysInput.value) || 0;

        const dailyHoursDecimal = h + (m / 60);
        const weeklyTotal = dailyHoursDecimal * d;
        row.querySelector('.weekly-total').textContent = formatDecimalToTime(weeklyTotal);

        const category = row.dataset.category;
        const tempData = { ...timeData };
        tempData[category] = { h, m, d };
        updateOverallSummary(tempData);
    }

    tableBody.addEventListener('input', (e) => {
        const row = e.target.closest('tr');
        if (row) { updateRowCalculations(row); }
    });

    tableBody.addEventListener('change', (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        const category = row.dataset.category;
        const hoursInput = row.querySelector('.hours-input');
        const minutesInput = row.querySelector('.minutes-input');
        const daysInput = row.querySelector('.days-input');

        let h = parseInt(hoursInput.value) || 0;
        let m = parseInt(minutesInput.value) || 0;
        let d = parseInt(daysInput.value) || 0;

        if (h < 0) h = 0; if (h > 24) h = 24;
        if (m < 0) m = 0;
        if (m >= 60) { h += Math.floor(m / 60); m %= 60; if (h > 24) h = 24; }
        if (d < 1) d = 1; if (d > 7) d = 7;

        timeData[category] = { h, m, d };

        hoursInput.value = h; minutesInput.value = m; daysInput.value = d;

        updateRowCalculations(row);
        saveData();
    });

    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
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
        const row = tableBody.querySelector(`tr[data-category="${categoryToDelete}"]`);
        if (row) {
            row.classList.add('fade-out');
            setTimeout(() => {
                delete timeData[categoryToDelete];
                saveData();
                renderTable();
                categoryToDelete = null;
            }, 150);
        }
        modalOverlay.style.display = 'none';
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all categories and data? This cannot be undone.')) {
            localStorage.removeItem('timeDataV5');
            location.reload();
        }
    });

    // Initial Load
    loadData();
});
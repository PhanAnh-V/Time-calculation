document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('table-body');
    const newCategoryInput = document.getElementById('new-category-input');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const totalHoursEl = document.getElementById('total-hours');
    const remainingHoursEl = document.getElementById('remaining-hours');

    const weekHours = 168;
    let timeData = {};

    function loadData() {
        const savedData = JSON.parse(localStorage.getItem('timeDataV4'));
        timeData = savedData || {
            'Sleep': { h: 8, m: 0 },
            'Work': { h: 0, m: 0 },
        };
        renderTable();
    }

    function saveData() {
        localStorage.setItem('timeDataV4', JSON.stringify(timeData));
    }

    function renderTable() {
        tableBody.innerHTML = '';
        for (const category in timeData) {
            const dailyH = timeData[category].h || 0;
            const dailyM = timeData[category].m || 0;
            const dailyHoursDecimal = dailyH + (dailyM / 60);
            const weeklyTotal = dailyHoursDecimal * 7;

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
                <td class="weekly-total">${weeklyTotal.toFixed(2)}</td>
                <td><button class="delete-btn">Delete</button></td>
            `;
            tableBody.appendChild(row);
        }
        updateOverallSummary();
    }

    function updateOverallSummary() {
        let totalWeeklyHours = 0;
        for (const category in timeData) {
            const dailyHoursDecimal = (timeData[category].h || 0) + ((timeData[category].m || 0) / 60);
            totalWeeklyHours += dailyHoursDecimal * 7;
        }
        totalHoursEl.textContent = totalWeeklyHours.toFixed(2);
        remainingHoursEl.textContent = (weekHours - totalWeeklyHours).toFixed(2);
    }

    addCategoryBtn.addEventListener('click', () => {
        const newCategory = newCategoryInput.value.trim();
        if (newCategory && !timeData.hasOwnProperty(newCategory)) {
            timeData[newCategory] = { h: 0, m: 0 };
            saveData();
            renderTable();
            newCategoryInput.value = '';
        } else if (timeData.hasOwnProperty(newCategory)){
            alert('Category already exists!');
        }
    });

    tableBody.addEventListener('input', (e) => {
        const row = e.target.closest('tr');
        const category = row.dataset.category;

        if (e.target.classList.contains('hours-input')) {
            timeData[category].h = parseInt(e.target.value) || 0;
        } else if (e.target.classList.contains('minutes-input')) {
            timeData[category].m = parseInt(e.target.value) || 0;
        }
        
        // Update only the specific row's weekly total
        const dailyH = timeData[category].h || 0;
        const dailyM = timeData[category].m || 0;
        const dailyHoursDecimal = dailyH + (dailyM / 60);
        const weeklyTotal = dailyHoursDecimal * 7;
        row.querySelector('.weekly-total').textContent = weeklyTotal.toFixed(2);

        updateOverallSummary();
        saveData();
    });

    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const row = e.target.closest('tr');
            const category = row.dataset.category;
            if (confirm(`Are you sure you want to delete the "${category}" category?`)) {
                delete timeData[category];
                saveData();
                renderTable();
            }
        }
    });

    loadData();
});
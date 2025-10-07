document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('table-body');
    const newCategoryInput = document.getElementById('new-category-input');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const totalHoursEl = document.getElementById('total-hours');
    const remainingHoursEl = document.getElementById('remaining-hours');

    const weekHours = 168;
    let timeData = {};

    function loadData() {
        const savedData = JSON.parse(localStorage.getItem('timeDataV2')); // Use a new key for the new data structure
        timeData = savedData || {
            'Sleep': 8,
            'Work': 0,
        };
        renderTable();
    }

    function saveData() {
        localStorage.setItem('timeDataV2', JSON.stringify(timeData));
    }

    function renderTable() {
        tableBody.innerHTML = '';
        let totalWeeklyHours = 0;

        for (const category in timeData) {
            const dailyHours = parseFloat(timeData[category]) || 0;
            const weeklyTotal = dailyHours * 7;
            totalWeeklyHours += weeklyTotal;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category}</td>
                <td><input type="number" class="hours-input" data-category="${category}" value="${dailyHours}" min="0"></td>
                <td class="weekly-total">${weeklyTotal.toFixed(2)}</td>
                <td><button class="delete-btn" data-category="${category}">Delete</button></td>
            `;
            tableBody.appendChild(row);
        }
        updateSummary(totalWeeklyHours);
    }

    function updateSummary(totalWeeklyHours) {
        totalHoursEl.textContent = totalWeeklyHours.toFixed(2);
        remainingHoursEl.textContent = (weekHours - totalWeeklyHours).toFixed(2);
    }

    addCategoryBtn.addEventListener('click', () => {
        const newCategory = newCategoryInput.value.trim();
        if (newCategory && !timeData.hasOwnProperty(newCategory)) {
            timeData[newCategory] = 0;
            saveData();
            renderTable();
            newCategoryInput.value = '';
        } else if (timeData.hasOwnProperty(newCategory)){
            alert('Category already exists!');
        }
    });

    tableBody.addEventListener('input', (e) => {
        if (e.target.classList.contains('hours-input')) {
            const category = e.target.dataset.category;
            timeData[category] = e.target.value;
            saveData();
            renderTable(); // Re-render to update all calculations
        }
    });

    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const category = e.target.dataset.category;
            if (confirm(`Are you sure you want to delete the "${category}" category?`)) {
                delete timeData[category];
                saveData();
                renderTable();
            }
        }
    });

    loadData();
});

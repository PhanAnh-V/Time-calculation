document.addEventListener('DOMContentLoaded', () => {
    const totalHoursEl = document.getElementById('total-hours');
    const remainingHoursEl = document.getElementById('remaining-hours');
    const hoursInputs = document.querySelectorAll('.hours-input');

    const weekHours = 168;
    let timeData = {};

    function loadData() {
        const savedData = JSON.parse(localStorage.getItem('timeData'));
        timeData = savedData || {
            "Sleep": 0,
            "Part-time job": 0,
            "University/In-out class": 0,
            "Transportation time": 0
        };
        updateUI();
    }

    function saveData() {
        localStorage.setItem('timeData', JSON.stringify(timeData));
    }

    function updateUI() {
        let totalWeeklyHours = 0;
        hoursInputs.forEach(input => {
            const category = input.dataset.category;
            const weeklyHours = parseFloat(timeData[category]) || 0;
            input.value = weeklyHours;

            const dailyAverage = (weeklyHours / 7).toFixed(2);
            input.parentElement.nextElementSibling.textContent = dailyAverage;
            totalWeeklyHours += weeklyHours;
        });

        totalHoursEl.textContent = totalWeeklyHours;
        remainingHoursEl.textContent = weekHours - totalWeeklyHours;
    }

    hoursInputs.forEach(input => {
        input.addEventListener('input', () => {
            const category = input.dataset.category;
            timeData[category] = input.value;
            saveData();
            updateUI();
        });
    });

    loadData();
});
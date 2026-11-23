(function () {
    const leaderboardStorageKey = 'healthcal_daily_leaderboard';
    const recommendations = {
        chest: ['Push-ups', 'Dumbbell bench press'],
        leg: ['Bodyweight squats', 'Reverse lunges'],
        biceps: ['Dumbbell curls', 'Hammer curls']
    };

    const form = document.getElementById('muscle-training-form');
    const muscleSelect = document.getElementById('muscle-group');
    const tableBody = document.getElementById('exercise-table-body');
    const recommendationHeading = document.getElementById('recommendation-heading');
    const saveButton = document.getElementById('submit-exercises');
    const submitStatus = document.getElementById('exercise-submit-status');

    function getLocalDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function showRecommendations(muscle) {
        const exercises = recommendations[muscle];
        if (!exercises) return;

        recommendationHeading.textContent = `${muscle[0].toUpperCase()}${muscle.slice(1)} exercises`;
        tableBody.replaceChildren(...exercises.map(exercise => {
            const row = document.createElement('tr');
            const exerciseCell = document.createElement('td');
            const checkboxCell = document.createElement('td');
            const checkbox = document.createElement('input');

            exerciseCell.textContent = exercise;
            checkbox.type = 'checkbox';
            checkbox.value = exercise;
            checkbox.setAttribute('aria-label', `Mark ${exercise} as completed`);
            checkboxCell.append(checkbox);
            row.append(exerciseCell, checkboxCell);
            return row;
        }));
        saveButton.disabled = false;
        submitStatus.textContent = '';
    }

    function saveCompletedExercises() {
        const completedExercises = Array.from(
            tableBody.querySelectorAll('input[type="checkbox"]:checked'),
            checkbox => checkbox.value
        );

        if (!completedExercises.length) {
            submitStatus.textContent = 'Select at least one completed exercise before saving.';
            return;
        }

        let records;
        try {
            records = JSON.parse(localStorage.getItem(leaderboardStorageKey) || '[]');
            if (!Array.isArray(records)) throw new Error('Saved leaderboard data is not a list.');
        } catch (error) {
            submitStatus.textContent = 'Unable to read leaderboard records in this browser.';
            return;
        }

        const today = getLocalDate();
        const recordIndex = records.findIndex(record => record && record.date === today);
        const previousRecord = recordIndex >= 0 ? records[recordIndex] : {};
        const exercises = Array.isArray(previousRecord.exercises) ? previousRecord.exercises : [];
        const record = {
            date: today,
            completedCount: Number.isFinite(previousRecord.completedCount) ? previousRecord.completedCount : 0,
            totalCount: Number.isFinite(previousRecord.totalCount) ? previousRecord.totalCount : 0,
            tasks: Array.isArray(previousRecord.tasks) ? previousRecord.tasks : [],
            exercises: Array.from(new Set([...exercises, ...completedExercises]))
        };

        if (recordIndex >= 0) records[recordIndex] = record;
        else records.push(record);

        try {
            localStorage.setItem(leaderboardStorageKey, JSON.stringify(records));
            submitStatus.textContent = 'Completed exercises were saved to today\'s leaderboard record.';
        } catch (error) {
            submitStatus.textContent = 'Unable to save your exercises in this browser.';
        }
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        showRecommendations(muscleSelect.value);
    });

    saveButton.addEventListener('click', saveCompletedExercises);
})();

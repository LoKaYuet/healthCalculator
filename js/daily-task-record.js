(function () {
    //start
    const dailyTasks = [
        { id: 'water', title: 'Drink 8 glasses of water', completed: false },
        { id: 'walk', title: 'Take a 20-minute walk', completed: false },
        { id: 'fruit', title: 'Eat a serving of fruit', completed: false }
    ];
    const taskBody = document.getElementById('todo-task-body');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const submitButton = document.getElementById('submit-todos');
    const clearButton = document.getElementById('clear-leaderboard');
    const submitStatus = document.getElementById('todo-submit-status');
    const leaderboardStatus = document.getElementById('leaderboard-status');
    const leaderboardStorageKey = 'healthcal_daily_leaderboard';

    function getLeaderboardRecords() {
        try {
            const records = JSON.parse(localStorage.getItem(leaderboardStorageKey) || '[]');
            return Array.isArray(records) ? records : [];
        } catch (error) {
            return [];
        }
    }

    function renderLeaderboard() {
        const records = getLeaderboardRecords().sort((a, b) =>
        b.completedCount - a.completedCount || b.date.localeCompare(a.date)
        );

        if (!records.length) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 3;
            cell.textContent = 'No daily tasks submitted yet.';
            row.append(cell);
            leaderboardBody.replaceChildren(row);
            return;
        }

        leaderboardBody.replaceChildren(...records.map((record, index) => {
            const row = document.createElement('tr');
            const rankCell = document.createElement('td');
            const dateCell = document.createElement('td');
            const tasksCell = document.createElement('td');

            rankCell.textContent = String(index + 1);
            dateCell.textContent = record.date;
            tasksCell.textContent = `${record.completedCount}/${record.totalCount}: ${record.tasks.join(', ') || 'No tasks completed'}`;
            row.append(rankCell, dateCell, tasksCell);
            return row;
        }));
    }

    function getLocalDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function renderDailyTasks() {
        if (!taskBody) return;
        taskBody.replaceChildren(...dailyTasks.map(task => {
            const row = document.createElement('tr');
            const titleCell = document.createElement('td');
            const checkboxCell = document.createElement('td');
            const checkbox = document.createElement('input');

            titleCell.textContent = task.title;
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.dataset.taskId = task.id;
            checkbox.setAttribute('aria-label', `Complete ${task.title}`);
            checkboxCell.append(checkbox);
            row.append(titleCell, checkboxCell);
            return row;
        }));
    }

    taskBody.addEventListener('change', event => {
        if (!(event.target instanceof HTMLInputElement)) return;
        const task = dailyTasks.find(item => item.id === event.target.dataset.taskId);
        if (!task) return;
        task.completed = event.target.checked;
        renderDailyTasks();
    });
    renderDailyTasks();

    submitButton.addEventListener('click', () => {
        const records = getLeaderboardRecords();
        const completedTasks = dailyTasks.filter(task => task.completed).map(task => task.title);
        const today = getLocalDate();
        const record = {
            date: today,
            completedCount: completedTasks.length,
            totalCount: dailyTasks.length,
            tasks: completedTasks
        };
        const existingRecordIndex = records.findIndex(item => item.date === today);

        if (existingRecordIndex >= 0) records[existingRecordIndex] = record;
        else records.push(record);

        try {
            localStorage.setItem(leaderboardStorageKey, JSON.stringify(records));
            renderLeaderboard();
            submitStatus.textContent = "Today's tasks were added to the leaderboard.";
        } catch (error) {
            submitStatus.textContent = 'Unable to save your tasks in this browser.';
        }
    });

    clearButton.addEventListener('click', () => {
        const confirmed = window.confirm('Clear all past daily task records from the leaderboard?');
        if (!confirmed) return;

        const doubleConfirmed = window.confirm('Are you sure? This action cannot be undone.');
        if (!doubleConfirmed) return;

        try {
            localStorage.removeItem(leaderboardStorageKey);
            renderLeaderboard();
            leaderboardStatus.textContent = 'All past daily task records have been cleared.';
        } catch (error) {
            leaderboardStatus.textContent = 'Unable to clear saved records in this browser.';
        }
    });
    renderLeaderboard();
    //end
    })();

// small helper (same as in other pages)
function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
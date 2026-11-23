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
    const taskInput = document.getElementById('new-task-input');
    const addTaskButton = document.getElementById('add-task-btn');
    const leaderboardStorageKey = 'healthcal_daily_leaderboard';

    function createTaskId(title) {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || `task-${Date.now()}`;
    }

    function addNewTask() {
        if (!taskInput || !taskInput.value.trim()) return;

        const title = taskInput.value.trim();
        const duplicate = dailyTasks.some(task => task.title.toLowerCase() === title.toLowerCase());
        if (duplicate) {
            taskInput.value = '';
            taskInput.focus();
            return;
        }

        dailyTasks.push({
            id: createTaskId(title),
            title,
            completed: false
        });

        taskInput.value = '';
        renderDailyTasks();
        taskInput.focus();
    }

    function getLeaderboardRecords() {
        try {
            const records = JSON.parse(localStorage.getItem(leaderboardStorageKey) || '[]');
            return Array.isArray(records) ? records : [];
        } catch (error) {
            return [];
        }
    }

    function renderLeaderboard() {
        if (!leaderboardBody) return;

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
            const tasks = Array.isArray(record.tasks) ? record.tasks : [];
            const exercises = Array.isArray(record.exercises) ? record.exercises : [];
            const taskSummary = `${record.completedCount}/${record.totalCount}: ${tasks.join(', ') || 'No tasks completed'}`;
            tasksCell.textContent = exercises.length
                ? `${taskSummary}; Exercises: ${exercises.join(', ')}`
                : taskSummary;
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

        if (!dailyTasks.length) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 3;
            cell.textContent = 'No tasks yet. Add one above.';
            row.append(cell);
            taskBody.replaceChildren(row);
            return;
        }

        taskBody.replaceChildren(...dailyTasks.map(task => {
            const row = document.createElement('tr');
            const titleCell = document.createElement('td');
            const checkboxCell = document.createElement('td');
            const actionsCell = document.createElement('td');
            const checkbox = document.createElement('input');
            const removeButton = document.createElement('button');

            titleCell.textContent = task.title;
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.dataset.taskId = task.id;
            checkbox.setAttribute('aria-label', `Complete ${task.title}`);

            removeButton.type = 'button';
            removeButton.textContent = 'Remove';
            removeButton.className = 'task-remove-button';
            removeButton.setAttribute('aria-label', `Remove ${task.title}`);
            removeButton.addEventListener('click', () => {
                const index = dailyTasks.findIndex(item => item.id === task.id);
                if (index >= 0) {
                    dailyTasks.splice(index, 1);
                    renderDailyTasks();
                }
            });

            checkboxCell.append(checkbox);
            actionsCell.append(removeButton);
            row.append(titleCell, checkboxCell, actionsCell);
            return row;
        }));
    }

    if (taskBody) {
        taskBody.addEventListener('change', event => {
            if (!(event.target instanceof HTMLInputElement)) return;
            const task = dailyTasks.find(item => item.id === event.target.dataset.taskId);
            if (!task) return;
            task.completed = event.target.checked;
            renderDailyTasks();
        })
    };

    if (addTaskButton) {
        addTaskButton.addEventListener('click', addNewTask);
    }

    if (taskInput) {
        taskInput.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                addNewTask();
            }
        });
    }

    renderDailyTasks();

    if (submitButton) {
        submitButton.addEventListener('click', () => {
            const records = getLeaderboardRecords();
            const completedTasks = dailyTasks.filter(task => task.completed).map(task => task.title);
            const today = getLocalDate();
            const existingRecordIndex = records.findIndex(item => item.date === today);
            const record = {
                date: today,
                completedCount: completedTasks.length,
                totalCount: dailyTasks.length,
                tasks: completedTasks,
                exercises: existingRecordIndex >= 0 && Array.isArray(records[existingRecordIndex].exercises)
                    ? records[existingRecordIndex].exercises
                    : []
            };

            if (existingRecordIndex >= 0) records[existingRecordIndex] = record;
            else records.push(record);

            try {
                localStorage.setItem(leaderboardStorageKey, JSON.stringify(records));
                renderLeaderboard();
                if (submitStatus) {
                    submitStatus.textContent = "Today's tasks were added to the leaderboard.";
                }
            } catch (error) {
                if (submitStatus) {
                    submitStatus.textContent = 'Unable to save your tasks in this browser.';
                }
            }
        })
}   ;

    if (clearButton) {
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
    }
    renderLeaderboard();
    //end
    })();

// small helper (same as in other pages)
function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
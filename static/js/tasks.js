document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const projectId = document.getElementById("projectId").value;

    if (!token) {
        window.location.href = "/login";
        return;
    }

    const taskList = document.getElementById("taskList");

    let currentPage = 1;
    const limit = 5;

    // Load Tasks
    async function loadTasks(page = 1) {
        try {
            const response = await fetch(`/api/projects/${projectId}/tasks?page=${page}&limit=${limit}`, {
                headers: { "Authorization": "Bearer " + token }
            });

            if (response.status === 401) {
                window.location.href = "/login";
                return;
            }

            if (response.status === 403) {
                taskList.innerHTML = `<li style="color: red;"><strong>Access Denied:</strong> You do not have permission to view this project.</li>`;
                document.getElementById("createTaskForm").style.display = "none";
                return;
            }

            const data = await response.json();
            taskList.innerHTML = "";

            if (data.tasks && data.tasks.length > 0) {
                data.tasks.forEach(task => {
                    const row = document.createElement("div");
                    row.className = "task-row";

                    let badgeClass = "badge-todo";
                    let actionBtn = `<button onclick="updateStatus(${task.ID}, 'in_progress')" class="btn btn-sm btn-outline">Start</button>`;

                    if (task.Status === 'in_progress') {
                        badgeClass = "badge-progress";
                        actionBtn = `<button onclick="updateStatus(${task.ID}, 'done')" class="btn btn-sm btn-primary">Complete</button>`;
                    } else if (task.Status === 'done') {
                        badgeClass = "badge-done";
                        actionBtn = ""; // No action for done
                    }

                    row.innerHTML = `
                        <div class="task-info">
                            <span class="task-title">${task.Title} <span class="badge ${badgeClass}">${task.Status.replace('_', ' ')}</span></span>
                            <span class="task-desc">${task.Description || ''}</span>
                        </div>
                        <div class="task-meta">
                            ${actionBtn}
                            <button onclick="deleteTask(${task.ID})" class="btn btn-sm btn-danger">Delete</button>
                        </div>
                    `;
                    taskList.appendChild(row);
                });

                // Pagination Controls (Styled)
                const totalPages = data.totalPages;
                currentPage = data.currentPage;

                const paginationDiv = document.createElement("div");
                paginationDiv.style.marginTop = "2rem";
                paginationDiv.style.display = "flex";
                paginationDiv.style.justifyContent = "center";
                paginationDiv.style.gap = "1rem";
                paginationDiv.style.alignItems = "center";

                paginationDiv.innerHTML = `
                    <button class="btn btn-sm btn-outline" ${currentPage === 1 ? 'disabled style="opacity:0.5"' : ''} onclick="changePage(${currentPage - 1})">Previous</button>
                    <span style="font-weight: 500; color: var(--text-muted);">Page ${currentPage} of ${totalPages}</span>
                    <button class="btn btn-sm btn-outline" ${currentPage === totalPages ? 'disabled style="opacity:0.5"' : ''} onclick="changePage(${currentPage + 1})">Next</button>
                `;
                taskList.appendChild(paginationDiv);

            } else {
                taskList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No tasks found. Add one above!</div>`;
            }

        } catch (error) {
            console.error("Error loading tasks:", error);
        }
    }

    // Global pagination handler
    window.changePage = function (page) {
        loadTasks(page);
    }

    // Global function for status update
    window.updateStatus = async function (taskId, newStatus) {
        try {
            const response = await fetch(`/api/tasks/${taskId}/status`, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({ status: newStatus })
            });

            if (response.ok) {
                console.log("Status updated");
                loadTasks(currentPage);
                showFlash("Status updated!");
            } else {
                showFlash("Failed to update status", "error");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            showFlash("Error updating status", "error");
        }
    };

    // Global function for delete task
    window.deleteTask = async function (taskId) {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            });

            if (response.ok) {
                loadTasks(currentPage);
                showFlash("Task deleted!");
            } else {
                showFlash("Failed to delete task", "error");
            }
        } catch (error) {
            console.error("Error deleting task:", error);
            showFlash("Error deleting task", "error");
        }
    }

    // Create Task
    document.getElementById("createTaskForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        const title = document.getElementById("taskTitle").value;
        const description = document.getElementById("taskDesc").value;

        try {
            const response = await fetch(`/api/projects/${projectId}/tasks`, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({ title, description })
            });

            if (response.ok) {
                document.getElementById("taskTitle").value = "";
                document.getElementById("taskDesc").value = "";
                loadTasks(currentPage);
                showFlash("Task created!");
            } else {
                showFlash("Failed to create task", "error");
            }

        } catch (error) {
            console.error("Error creating task:", error);
            showFlash("Error creating task", "error");
        }
    });

    loadTasks(1);
});

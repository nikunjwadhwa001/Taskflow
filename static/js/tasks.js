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
                    const li = document.createElement("li");
                    let actionParams = '';
                    if (task.Status === 'todo') {
                        actionParams = `<button onclick="updateStatus(${task.ID}, 'in_progress')">Start</button>`;
                    } else if (task.Status === 'in_progress') {
                        actionParams = `<button onclick="updateStatus(${task.ID}, 'done')">Complete</button>`;
                    } else if (task.Status === 'done') {
                        actionParams = `<span>✅</span>`;
                    }

                    li.innerHTML = `
                        <strong>${task.Title}</strong> — ${task.Status} 
                        ${actionParams}
                        <button onclick="deleteTask(${task.ID})" style="color: red; margin-left: 10px;">Delete</button>
                    `;
                    taskList.appendChild(li);
                });

                // Pagination Controls
                const totalPages = data.totalPages;
                currentPage = data.currentPage;

                const paginationDiv = document.createElement("div");
                paginationDiv.style.marginTop = "20px";
                paginationDiv.innerHTML = `
                    <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Previous</button>
                    <span>Page ${currentPage} of ${totalPages}</span>
                    <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next</button>
                `;
                taskList.appendChild(paginationDiv);

            } else {
                taskList.innerHTML = "<li>No tasks yet</li>";
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
                loadTasks(currentPage); // Refresh list to show new status/buttons
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
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
            } else {
                alert("Failed to delete task");
            }
        } catch (error) {
            console.error("Error deleting task:", error);
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
            } else {
                alert("Failed to create task");
            }

        } catch (error) {
            console.error("Error creating task:", error);
        }
    });

    loadTasks(1);
});

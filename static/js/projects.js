document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/login";
        return;
    }

    const projectList = document.getElementById("projectList");

    // Function to fetch and display projects
    async function loadProjects() {
        try {
            const response = await fetch("/api/projects", {
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (response.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/login";
                return;
            }

            const data = await response.json();
            projectList.innerHTML = ""; // Clear list

            if (data.projects && data.projects.length > 0) {
                data.projects.forEach(project => {
                    const card = document.createElement("div");
                    card.className = "project-card";
                    card.innerHTML = `
                        <div>
                            <span class="project-name">${project.Name}</span>
                            <span style="color: var(--text-muted); font-size: 0.85rem;">Project ID: #${project.ID}</span>
                        </div>
                        <div class="project-actions">
                            <a href="/projects/${project.ID}/tasks" class="btn btn-sm btn-outline">View Board</a>
                            <button onclick="deleteProject(${project.ID})" class="btn btn-sm btn-danger">Delete</button>
                        </div>
                    `;
                    projectList.appendChild(card);
                });
            } else {
                projectList.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No projects found. Create one above!</p>`;
            }

        } catch (error) {
            console.error("Error loading projects:", error);
        }
    }

    // Delete Project Function
    window.deleteProject = async function (projectId) {
        if (!confirm("Are you sure? This will delete all tasks in the project!")) return;

        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            });

            if (response.ok) {
                loadProjects();
                showFlash("Project deleted!");
            } else {
                showFlash("Failed to delete project", "error");
            }
        } catch (error) {
            console.error("Error deleting project:", error);
            showFlash("Error deleting project", "error");
        }
    }

    // Handle Create Project
    const createForm = document.getElementById("createProjectForm");
    createForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const name = document.getElementById("projectName").value;

        try {
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Bearer " + token,
                },
                body: new URLSearchParams({ name }),
            });

            if (response.ok) {
                document.getElementById("projectName").value = "";
                loadProjects();
                showFlash("Project created!");
            } else {
                showFlash("Failed to create project", "error");
            }
        } catch (error) {
            console.error("Error creating project:", error);
            showFlash("Error creating project", "error");
        }
    });

    // Initial Load
    loadProjects();
});

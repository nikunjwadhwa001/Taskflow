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
                    const li = document.createElement("li");
                    li.innerHTML = `
                        <a href="/projects/${project.ID}/tasks">${project.Name}</a>
                        <button onclick="deleteProject(${project.ID})" style="color: red; margin-left: 10px;">Delete</button>
                    `;
                    projectList.appendChild(li);
                });
            } else {
                projectList.innerHTML = "<li>No projects yet</li>";
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
            } else {
                alert("Failed to delete project");
            }
        } catch (error) {
            console.error("Error deleting project:", error);
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
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({ name: name })
            });

            if (!response.ok) {
                alert("Failed to create project");
                return;
            }

            // Reload list and clear input
            document.getElementById("projectName").value = "";
            loadProjects();

        } catch (error) {
            console.error("Error creating project:", error);
        }
    });

    // Initial Load
    loadProjects();
});

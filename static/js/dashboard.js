document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/login";
        return;
    }

    fetch("/api/dashboard", {
        headers: {
            "Authorization": "Bearer " + token,
        },
    })
        .then(async res => {
            if (res.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/login";
                return;
            }
            if (!res.ok) {
                throw new Error("Server error: " + res.status);
            }
            return res.json();
        })
        .then(data => {
            if (data) {
                document.getElementById("totalProjects").innerText = data.projectCount || 0;
                document.getElementById("totalTasks").innerText = data.taskCount || 0;
                document.getElementById("todoCount").innerText = data.todoCount || 0;
                document.getElementById("inProgressCount").innerText = data.inProgressCount || 0;
                document.getElementById("doneCount").innerText = data.doneCount || 0;
            }
        })
        .catch(err => {
            console.error("Error loading dashboard:", err);
            document.getElementById("totalProjects").innerText = "Err";
            document.getElementById("totalTasks").innerText = "Err";
        });
});

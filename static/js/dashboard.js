// Example of protected API call
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "/login";
}

fetch("/api/dashboard", {
    headers: {
        "Authorization": "Bearer " + token,
    },
})
    .then(res => {
        if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
    });

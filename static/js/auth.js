// Handle login form submission
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("form");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault(); // stop page reload

        const email = loginForm.email.value;
        const password = loginForm.password.value;

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    email: email,
                    password: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data || "Login failed");
                return;
            }

            // Store JWT token
            localStorage.setItem("token", data.token);

            // Redirect to dashboard
            window.location.href = "/dashboard";

        } catch (error) {
            alert("Something went wrong");
        }
    });
});

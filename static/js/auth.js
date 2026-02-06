// Handle login form submission
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("form");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault(); // stop page reload

        const email = loginForm.email.value;
        const password = loginForm.password.value;

        // Use custom showFlash if available, else fallback
        const notify = window.showFlash || alert;

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
                notify(data.error || "Login failed. Please check your credentials.", "error");
                return;
            }

            // Store JWT token
            localStorage.setItem("token", data.token);

            // Redirect to dashboard
            notify("Login successful!", "success");
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 500);

        } catch (error) {
            console.error(error);
            notify("Network error. Please try again.", "error");
        }
    });
});

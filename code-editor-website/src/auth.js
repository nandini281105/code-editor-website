document.addEventListener("DOMContentLoaded", () => {
    const registerBtn = document.getElementById("registerBtn");
    if (registerBtn) {
        registerBtn.addEventListener("click", async () => {
            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            if (!username || !email || !password) {
                alert("Please fill all fields");
                return;
            }
            try {
                const res = await fetch("http://localhost:3001/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    alert("Registration Successful!");
                    window.location.href = "login.html";
                } else {
                    alert(data.error || "Registration failed");
                }
            } catch (err) {
                console.error("Signup error:", err);
                alert("Network error. Please try again.");
            }
        });
    }
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value;
            if (!email || !password) {
                alert("Please enter email and password");
                return;
            }
            try {
                const res = await fetch("http://localhost:3001/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    alert("Login Successful!");
                    localStorage.setItem("userId", data.user.id);
                    localStorage.setItem("username", data.user.username);
                    localStorage.setItem("email", data.user.email);
                    localStorage.setItem("points", data.user.points);
                    window.location.href = "index.html";
                } else {
                    alert(data.error || "Invalid Email or Password");
                }
            } catch (err) {
                console.error("Login error:", err);
                alert("Network error. Please try again.");
            }
        });
    }
});


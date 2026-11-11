
document.addEventListener("DOMContentLoaded", () => {

    // Initialise Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Update copyright year
    document.querySelectorAll("[data-year]").forEach(element => {
        element.textContent = new Date().getFullYear();
    });


    // MOBILE NAVIGATION
    const menuButton = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuButton && navLinks) {

        menuButton.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("show");

            menuButton.setAttribute("aria-expanded", String(isOpen));

            menuButton.setAttribute(
                "aria-label",
                isOpen ? "Close navigation menu" : "Open navigation menu"
            );
        });

        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("show");
                menuButton.setAttribute("aria-expanded", "false");
                menuButton.setAttribute("aria-label", "Open navigation menu");
            });
        });
    }


    // ACADEMIC PLANNER
    const taskForm = document.getElementById("taskForm");

    if (taskForm) {

        const titleInput = document.getElementById("taskTitle");
        const dateInput = document.getElementById("taskDate");
        const taskList = document.getElementById("taskList");
        const emptyState = document.getElementById("emptyState");
        const taskMessage = document.getElementById("taskMessage");
        const clearCompletedButton = document.getElementById("clearCompleted");

        const filterButtons = document.querySelectorAll("[data-filter]");

        const progressPercent = document.getElementById("progressPercent");
        const progressBar = document.getElementById("progressBar");
        const completedCount = document.getElementById("completedCount");
        const pendingCount = document.getElementById("pendingCount");

        const STORAGE_KEY = "studentPortfolioTasks";

        let tasks = [];
        let currentFilter = "all";

        // Load saved tasks
        try {
            tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

            if (!Array.isArray(tasks)) {
                tasks = [];
            }

        } catch (error) {
            tasks = [];
        }


        // Save tasks
        function saveTasks() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
            } catch (error) {
                taskMessage.textContent = "Unable to save tasks in this browser.";
                taskMessage.className = "form-message error-message";
            }
        }


        // Format due date
        function formatDate(dateString) {

            if (!dateString) {
                return "No due date";
            }

            const date = new Date(`${dateString}T00:00:00`);

            return date.toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
        }


        // Display tasks
        function renderTasks() {

            taskList.innerHTML = "";

            const visibleTasks = tasks.filter(task => {

                if (currentFilter === "active") {
                    return !task.completed;
                }

                if (currentFilter === "completed") {
                    return task.completed;
                }

                return true;
            });


            emptyState.hidden = visibleTasks.length > 0;


            visibleTasks.forEach(task => {

                const item = document.createElement("li");

                item.className = `task-item${task.completed ? " is-complete" : ""}`;


                // Checkbox
                const checkbox = document.createElement("input");

                checkbox.type = "checkbox";
                checkbox.checked = task.completed;
                checkbox.className = "task-checkbox";

                checkbox.setAttribute(
                    "aria-label",
                    `Mark ${task.title} as ${task.completed ? "pending" : "completed"}`
                );

                checkbox.addEventListener("change", () => {

                    tasks = tasks.map(entry =>
                        entry.id === task.id
                            ? { ...entry, completed: checkbox.checked }
                            : entry
                    );

                    saveTasks();
                    renderTasks();
                });


                // Task details
                const details = document.createElement("div");

                details.className = "task-details";

                const title = document.createElement("span");

                title.className = "task-title";
                title.textContent = task.title;

                const due = document.createElement("small");

                due.textContent = formatDate(task.dueDate);

                details.append(title, due);


                // Delete button
                const deleteButton = document.createElement("button");

                deleteButton.type = "button";
                deleteButton.className = "delete-task";
                deleteButton.textContent = "Delete";

                deleteButton.setAttribute(
                    "aria-label",
                    `Delete task ${task.title}`
                );

                deleteButton.addEventListener("click", () => {

                    tasks = tasks.filter(entry => entry.id !== task.id);

                    saveTasks();
                    renderTasks();
                });


                item.append(checkbox, details, deleteButton);

                taskList.appendChild(item);
            });


            // Calculate progress
            const completed = tasks.filter(task => task.completed).length;

            const pending = tasks.length - completed;

            const percentage = tasks.length
                ? Math.round((completed / tasks.length) * 100)
                : 0;


            progressPercent.textContent = `${percentage}%`;

            progressBar.style.width = `${percentage}%`;

            completedCount.textContent = completed;

            pendingCount.textContent = pending;
        }


        // Add new task
        taskForm.addEventListener("submit", event => {

            event.preventDefault();

            const title = titleInput.value.trim();

            if (!title) {

                taskMessage.textContent = "Please enter a task description.";

                taskMessage.className = "form-message error-message";

                titleInput.focus();

                return;
            }


            const newTask = {

                id: window.crypto && window.crypto.randomUUID
                    ? window.crypto.randomUUID()
                    : `${Date.now()}-${Math.random()}`,

                title: title,

                dueDate: dateInput.value,

                completed: false
            };


            tasks.unshift(newTask);

            saveTasks();

            taskForm.reset();


            taskMessage.textContent = "Task added successfully.";

            taskMessage.className = "form-message success-message";


            currentFilter = "all";

            filterButtons.forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.filter === "all"
                );
            });


            renderTasks();

            titleInput.focus();
        });


        // Task filters
        filterButtons.forEach(button => {

            button.addEventListener("click", () => {

                currentFilter = button.dataset.filter;

                filterButtons.forEach(item => {

                    item.classList.toggle("active", item === button);
                });

                renderTasks();
            });
        });


        // Clear completed tasks
        if (clearCompletedButton) {

            clearCompletedButton.addEventListener("click", () => {

                tasks = tasks.filter(task => !task.completed);

                saveTasks();

                renderTasks();

                taskMessage.textContent = "Completed tasks cleared.";

                taskMessage.className = "form-message";
            });
        }


        renderTasks();
    }



    // CONTACT FORM VALIDATION
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {

        const fields = {

            name: document.getElementById("name"),

            email: document.getElementById("email"),

            phone: document.getElementById("phone"),

            message: document.getElementById("message")
        };


        const status = document.getElementById("contactStatus");

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const phonePattern = /^\d+$/;


        // Display field errors
        function showFieldError(fieldName, message) {

            const errorElement = document.getElementById(`${fieldName}Error`);

            if (errorElement) {
                errorElement.textContent = message;
            }

            if (fields[fieldName]) {

                fields[fieldName].setAttribute(
                    "aria-invalid",
                    message ? "true" : "false"
                );
            }
        }


        // Clear errors when user types
        Object.entries(fields).forEach(([fieldName, field]) => {

            if (!field) return;

            field.addEventListener("input", () => {

                showFieldError(fieldName, "");
            });
        });


        // Validate contact form
        contactForm.addEventListener("submit", event => {

            event.preventDefault();

            let valid = true;


            Object.entries(fields).forEach(([fieldName, field]) => {

                if (!field) return;

                const value = field.value.trim();

                let error = "";


                if (!value) {

                    error = "This field is required.";

                } else if (
                    fieldName === "email" &&
                    !emailPattern.test(value)
                ) {

                    error = "Enter a valid email address.";

                } else if (
                    fieldName === "phone" &&
                    !phonePattern.test(value)
                ) {

                    error = "Use digits only (0–9).";
                }


                showFieldError(fieldName, error);

                if (error) {
                    valid = false;
                }
            });


            if (!valid) {

                status.textContent =
                    "Please correct the highlighted fields and try again.";

                status.className = "form-message error-message";

                return;
            }


            status.textContent =
                `Thank you, ${fields.name.value.trim()}. Your form passed validation. This demonstration does not send messages to a server.`;

            status.className = "form-message success-message";


            contactForm.reset();


            Object.keys(fields).forEach(fieldName => {

                showFieldError(fieldName, "");
            });
        });
    }

});

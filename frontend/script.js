// ============================================================
// PREM DAILY TRACKER AI
// Frontend JavaScript
// Backend: Spring Boot
// ============================================================

const API_BASE_URL = "http://localhost:8080";


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("PREM Daily Tracker started");

    loadSummary();

    setupChat();

    setupQuickActions();

});


// ============================================================
// CHAT SETUP
// ============================================================

function setupChat() {

    const sendButton =
        document.getElementById("sendButton") ||
        document.getElementById("send-btn") ||
        document.querySelector(".send-btn");

    const input =
        document.getElementById("messageInput") ||
        document.getElementById("message-input") ||
        document.querySelector("input[type='text']") ||
        document.querySelector("textarea");

    if (!input) {
        console.warn("Chat input not found.");
        return;
    }

    // Send button
    if (sendButton) {

        sendButton.addEventListener("click", function () {

            const message = input.value.trim();

            if (message === "") {
                return;
            }

            sendMessage(message);

        });

    }

    // Enter key
    input.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {

            // Shift + Enter = new line
            if (event.shiftKey) {
                return;
            }

            event.preventDefault();

            const message = input.value.trim();

            if (message === "") {
                return;
            }

            sendMessage(message);

        }

    });

}


// ============================================================
// SEND MESSAGE TO SPRING BOOT
// ============================================================

async function sendMessage(message) {

    console.log("Sending message:", message);

    // Display user message
    addUserMessage(message);

    // Clear input
    clearInput();

    // Show typing message
    const loadingMessage = addLoadingMessage();

    try {

        const response = await fetch(
            API_BASE_URL + "/track",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: message
                })
            }
        );


        // Remove loading message
        removeLoadingMessage(loadingMessage);


        if (!response.ok) {

            let errorText = "";

            try {
                errorText = await response.text();
            } catch (e) {
                errorText = "";
            }

            throw new Error(
                "Backend returned HTTP " +
                response.status +
                " " +
                errorText
            );
        }


        // Backend currently returns text
        const result = await response.text();

        console.log("Backend response:", result);


        // Display AI response
        addAIMessage(result);


        // Refresh dashboard values
        await loadSummary();


    } catch (error) {

        console.error("Backend connection error:", error);

        removeLoadingMessage(loadingMessage);

        addAIMessage(
            "⚠️ I couldn't connect to the Personal Tracker backend. " +
            "Please make sure Spring Boot is running on port 8080."
        );

    }

}


// ============================================================
// GET DAILY SUMMARY
// ============================================================

async function loadSummary() {

    console.log("Loading daily summary...");

    try {

        const response = await fetch(
            API_BASE_URL + "/summary",
            {
                method: "GET"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Summary API returned HTTP " +
                response.status
            );

        }


        const summaryText = await response.text();

        console.log("Summary:", summaryText);


        updateDashboard(summaryText);


    } catch (error) {

        console.error(
            "Could not load dashboard summary:",
            error
        );

    }

}


// ============================================================
// UPDATE DASHBOARD
// ============================================================

function updateDashboard(summaryText) {

    console.log("Updating dashboard...");

    /*
        Example backend response:

        Today's Summary:
        Study Hours: 9.0
        Total Expenses: ₹350.0
        Pending Tasks: 0
        Completed Tasks: 2
    */


    const studyMatch =
        summaryText.match(/Study Hours:\s*([\d.]+)/i);

    const expenseMatch =
        summaryText.match(/Total Expenses:\s*₹?\s*([\d.]+)/i);

    const pendingMatch =
        summaryText.match(/Pending Tasks:\s*(\d+)/i);

    const completedMatch =
        summaryText.match(/Completed Tasks:\s*(\d+)/i);


    const studyHours =
        studyMatch ? studyMatch[1] : "0";

    const expenses =
        expenseMatch ? expenseMatch[1] : "0";

    const pendingTasks =
        pendingMatch ? pendingMatch[1] : "0";

    const completedTasks =
        completedMatch ? completedMatch[1] : "0";


    console.log({
        studyHours,
        expenses,
        pendingTasks,
        completedTasks
    });


    // --------------------------------------------------------
    // Find dashboard elements
    // --------------------------------------------------------

    updateElement(
        [
            "studyHours",
            "study-hours",
            "studyHoursValue"
        ],
        studyHours
    );


    updateElement(
        [
            "expenses",
            "expense",
            "totalExpenses",
            "expensesValue"
        ],
        "₹" + expenses
    );


    updateElement(
        [
            "pendingTasks",
            "pending-tasks",
            "pendingTasksValue"
        ],
        pendingTasks
    );


    updateElement(
        [
            "completedTasks",
            "completed-tasks",
            "completedTasksValue"
        ],
        completedTasks
    );


    // --------------------------------------------------------
    // Update progress section
    // --------------------------------------------------------

    updateElement(
        [
            "progressStudy",
            "progress-study"
        ],
        studyHours + "h"
    );


    updateElement(
        [
            "progressTasks",
            "progress-tasks"
        ],
        pendingTasks
    );


    updateElement(
        [
            "progressSpent",
            "progress-spent"
        ],
        "₹" + expenses
    );


}


// ============================================================
// GENERIC ELEMENT UPDATER
// ============================================================

function updateElement(ids, value) {

    for (const id of ids) {

        const element = document.getElementById(id);

        if (element) {

            element.textContent = value;

            console.log(
                "Updated #" + id + " → " + value
            );

            return;

        }

    }

}


// ============================================================
// ADD USER MESSAGE TO CHAT
// ============================================================

function addUserMessage(message) {

    const chatContainer = getChatContainer();

    if (!chatContainer) {
        console.warn("Chat container not found.");
        return;
    }


    const messageWrapper =
        document.createElement("div");

    messageWrapper.className =
        "message user-message";


    messageWrapper.innerHTML = `
        <div class="message-content">
            <strong>You</strong>
            <p>${escapeHTML(message)}</p>
        </div>
    `;


    chatContainer.appendChild(messageWrapper);

    scrollChatToBottom();

}


// ============================================================
// ADD AI MESSAGE TO CHAT
// ============================================================

function addAIMessage(message) {

    const chatContainer = getChatContainer();

    if (!chatContainer) {
        console.warn("Chat container not found.");
        return;
    }


    const messageWrapper =
        document.createElement("div");

    messageWrapper.className =
        "message ai-message";


    messageWrapper.innerHTML = `
        <div class="message-icon">
            🤖
        </div>

        <div class="message-content">
            <strong>PREM AI</strong>
            <p>${formatAIResponse(message)}</p>
        </div>
    `;


    chatContainer.appendChild(messageWrapper);

    scrollChatToBottom();

}


// ============================================================
// LOADING MESSAGE
// ============================================================

function addLoadingMessage() {

    const chatContainer = getChatContainer();

    if (!chatContainer) {
        return null;
    }


    const loading =
        document.createElement("div");

    loading.className =
        "message ai-message loading-message";


    loading.innerHTML = `
        <div class="message-icon">
            🤖
        </div>

        <div class="message-content">
            <strong>PREM AI</strong>
            <p>
                <span class="typing">Thinking...</span>
            </p>
        </div>
    `;


    chatContainer.appendChild(loading);

    scrollChatToBottom();

    return loading;

}


// ============================================================
// REMOVE LOADING MESSAGE
// ============================================================

function removeLoadingMessage(element) {

    if (element && element.parentNode) {

        element.parentNode.removeChild(element);

    }

}


// ============================================================
// FIND CHAT CONTAINER
// ============================================================

function getChatContainer() {

    return (
        document.getElementById("chatMessages") ||
        document.getElementById("chat-messages") ||
        document.getElementById("messages") ||
        document.querySelector(".chat-messages") ||
        document.querySelector(".messages")
    );

}


// ============================================================
// CLEAR INPUT
// ============================================================

function clearInput() {

    const input =
        document.getElementById("messageInput") ||
        document.getElementById("message-input") ||
        document.querySelector("input[type='text']") ||
        document.querySelector("textarea");


    if (input) {

        input.value = "";

        input.focus();

    }

}


// ============================================================
// SCROLL CHAT
// ============================================================

function scrollChatToBottom() {

    const chatContainer = getChatContainer();

    if (!chatContainer) {
        return;
    }


    setTimeout(function () {

        chatContainer.scrollTop =
            chatContainer.scrollHeight;

    }, 50);

}


// ============================================================
// FORMAT AI RESPONSE
// ============================================================

function formatAIResponse(message) {

    if (!message) {
        return "";
    }


    /*
        Convert new lines into <br>
        so backend responses look clean.
    */

    let formatted =
        escapeHTML(message);


    formatted =
        formatted.replace(/\n/g, "<br>");


    return formatted;

}


// ============================================================
// SECURITY
// ============================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ============================================================
// QUICK ACTIONS
// ============================================================

function setupQuickActions() {

    const buttons =
        document.querySelectorAll(
            ".quick-action, .suggestion, .example-message"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const message =
                    button.dataset.message ||
                    button.textContent.trim();


                if (message) {

                    sendMessage(message);

                }

            }
        );

    });

}


// ============================================================
// REFRESH BUTTON
// ============================================================

function refreshDashboard() {

    loadSummary();

}


// ============================================================
// TEST BACKEND
// ============================================================

async function testBackend() {

    try {

        const response =
            await fetch(
                API_BASE_URL + "/hello"
            );


        const result =
            await response.text();


        console.log(
            "Backend test:",
            result
        );


        return result;


    } catch (error) {

        console.error(
            "Backend is not reachable:",
            error
        );

    }

}


// ============================================================
// OPTIONAL: TEST BACKEND WHEN PAGE LOADS
// ============================================================

testBackend();
// ==========================================
// PREM DAILY TRACKER AI
// ==========================================


// ==========================================
// LOAD SUMMARY
// ==========================================

async function loadSummary() {

    try {

        const response =
            await fetch("/summary");


        if (!response.ok) {

            throw new Error(
                "Summary API failed: " +
                response.status
            );

        }


        const summary =
            await response.text();


        console.log(
            "SUMMARY:",
            summary
        );


        updateDashboard(summary);


    } catch (error) {

        console.error(
            "Summary error:",
            error
        );

    }

}


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard(summary) {


    // --------------------------------------
    // STUDY HOURS
    // --------------------------------------

    const studyMatch =
        summary.match(
            /Study Hours:\s*([\d.]+)/
        );


    // --------------------------------------
    // EXPENSES
    // --------------------------------------

    const expenseMatch =
        summary.match(
            /Total Expenses:\s*₹?([\d.]+)/
        );


    // --------------------------------------
    // PENDING TASKS
    // --------------------------------------

    const pendingMatch =
        summary.match(
            /Pending Tasks:\s*(\d+)/
        );


    // --------------------------------------
    // COMPLETED TASKS
    // --------------------------------------

    const completedMatch =
        summary.match(
            /Completed Tasks:\s*(\d+)/
        );


    const studyHours =
        studyMatch
            ? Number(studyMatch[1])
            : 0;


    const expenses =
        expenseMatch
            ? Number(expenseMatch[1])
            : 0;


    const pendingTasks =
        pendingMatch
            ? Number(pendingMatch[1])
            : 0;


    const completedTasks =
        completedMatch
            ? Number(completedMatch[1])
            : 0;


    // ======================================
    // MAIN CARDS
    // ======================================

    document.getElementById(
        "studyHours"
    ).textContent = studyHours;


    document.getElementById(
        "expenses"
    ).textContent =
        "₹" + expenses;


    document.getElementById(
        "pendingTasks"
    ).textContent =
        pendingTasks;


    document.getElementById(
        "completedTasks"
    ).textContent =
        completedTasks;


    // ======================================
    // MINI STATS
    // ======================================

    document.getElementById(
        "miniStudy"
    ).textContent =
        studyHours + "h";


    document.getElementById(
        "miniTasks"
    ).textContent =
        completedTasks;


    document.getElementById(
        "miniExpense"
    ).textContent =
        "₹" + expenses;


    // ======================================
    // DAILY PROGRESS
    // ======================================

    // Study goal = 8 hours

    const studyPercent =
        Math.min(
            (studyHours / 8) * 100,
            100
        );


    // Task goal = 5 completed tasks

    const taskPercent =
        Math.min(
            (completedTasks / 5) * 100,
            100
        );


    const dailyProgress =
        Math.round(
            (studyPercent + taskPercent) / 2
        );


    document.getElementById(
        "progressText"
    ).textContent =
        dailyProgress + "%";


    document.getElementById(
        "progressBar"
    ).style.width =
        dailyProgress + "%";

}


// ==========================================
// SEND MESSAGE TO BACKEND
// ==========================================

async function sendMessage() {


    const input =
        document.getElementById(
            "messageInput"
        );


    const message =
        input.value.trim();


    // Don't send empty messages

    if (!message) {

        return;

    }


    // Add user's message

    addUserMessage(message);


    // Clear input

    input.value = "";


    // Show loading

    const loadingMessage =
        addAgentMessage(
            "Thinking..."
        );


    try {


        const response =
            await fetch(
                "/track",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            message: message
                        })

                }
            );


        if (!response.ok) {

            throw new Error(
                "AI API failed: " +
                response.status
            );

        }


        const result =
            await response.text();


        console.log(
            "AI RESPONSE:",
            result
        );


        // Remove Thinking...

        loadingMessage.remove();


        // Add actual AI response

        addAgentMessage(
            result
        );


        // Refresh dashboard

        await loadSummary();


    } catch (error) {


        console.error(
            "Track error:",
            error
        );


        loadingMessage.remove();


        addAgentMessage(
            "Sorry, I could not connect to the AI backend."
        );

    }

}


// ==========================================
// QUICK MESSAGE
// ==========================================

function quickMessage(message) {


    const input =
        document.getElementById(
            "messageInput"
        );


    input.value =
        message;


    sendMessage();

}


// ==========================================
// ENTER KEY
// ==========================================

function handleEnter(event) {


    if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();

    }

}


// ==========================================
// ADD USER MESSAGE
// ==========================================

function addUserMessage(message) {


    const chatBox =
        document.getElementById(
            "chatBox"
        );


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "message user-message";


    wrapper.innerHTML = `

        <div class="bubble">

            <strong>
                You
            </strong>

            <p>
                ${escapeHtml(message)}
            </p>

        </div>

    `;


    chatBox.appendChild(
        wrapper
    );


    scrollChat();

}


// ==========================================
// ADD AI MESSAGE
// ==========================================

function addAgentMessage(message) {


    const chatBox =
        document.getElementById(
            "chatBox"
        );


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "message agent-message";


    wrapper.innerHTML = `

        <div class="message-avatar">
            🤖
        </div>

        <div class="bubble">

            <strong>
                PREM AI
            </strong>

            <p>
                ${escapeHtml(message)}
            </p>

        </div>

    `;


    chatBox.appendChild(
        wrapper
    );


    scrollChat();


    return wrapper;

}


// ==========================================
// SCROLL CHAT
// ==========================================

function scrollChat() {


    const chatBox =
        document.getElementById(
            "chatBox"
        );


    chatBox.scrollTop =
        chatBox.scrollHeight;

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;

}


// ==========================================
// INITIAL LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadSummary();

    }
);
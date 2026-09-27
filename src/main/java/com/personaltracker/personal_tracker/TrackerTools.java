package com.personaltracker.personal_tracker;

import java.util.List;
import java.util.Map;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class TrackerTools {

    private final JdbcTemplate jdbcTemplate;

    public TrackerTools(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // =========================================================
    // 1. SAVE STUDY PROGRESS
    // =========================================================

    @Tool(description = "Save the user's study progress with subject and number of hours studied")
    public String saveProgress(String subject, double hours) {

        String sql =
                "INSERT INTO study_progress (subject, hours, created_at) " +
                "VALUES (?, ?, NOW())";

        try {
            jdbcTemplate.update(sql, subject, hours);

            return "Study progress saved successfully: "
                    + subject + " - " + hours + " hours.";

        } catch (Exception e) {
            return "Unable to save study progress: " + e.getMessage();
        }
    }


    // =========================================================
    // 2. GET STUDY HOURS THIS WEEK
    // =========================================================

    @Tool(description = "Get the total number of study hours for the current week")
    public String getStudyHoursThisWeek() {

        String sql =
                "SELECT COALESCE(SUM(hours), 0) " +
                "FROM study_progress " +
                "WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)";

        try {
            Double hours =
                    jdbcTemplate.queryForObject(sql, Double.class);

            return "You studied " + hours + " hours this week.";

        } catch (Exception e) {
            return "Unable to get study hours: " + e.getMessage();
        }
    }


    // =========================================================
    // 3. SAVE EXPENSE
    // =========================================================

    @Tool(description = "Save an expense with amount, category and description")
    public String saveExpense(
            double amount,
            String category,
            String description) {

        String sql =
                "INSERT INTO expenses " +
                "(amount, category, description, created_at) " +
                "VALUES (?, ?, ?, NOW())";

        try {
            jdbcTemplate.update(
                    sql,
                    amount,
                    category,
                    description
            );

            return "Expense recorded successfully: ₹"
                    + amount
                    + " for "
                    + category
                    + ".";

        } catch (Exception e) {
            return "Unable to save expense: " + e.getMessage();
        }
    }


    // =========================================================
    // 4. GET RECENT EXPENSES
    // =========================================================

    @Tool(description = "Get the user's recent expenses")
    public String getRecentExpenses() {

        String sql =
                "SELECT amount, category, description, created_at " +
                "FROM expenses " +
                "ORDER BY created_at DESC " +
                "LIMIT 10";

        try {

            List<Map<String, Object>> expenses =
                    jdbcTemplate.queryForList(sql);

            if (expenses.isEmpty()) {
                return "You have no expenses recorded.";
            }

            StringBuilder result =
                    new StringBuilder("Here are your recent expenses:\n\n");

            for (Map<String, Object> expense : expenses) {

                result.append("- Category: ")
                        .append(expense.get("category"))
                        .append("\n");

                result.append("  Amount: ₹")
                        .append(expense.get("amount"))
                        .append("\n");

                result.append("  Description: ")
                        .append(expense.get("description"))
                        .append("\n");

                result.append("  Date: ")
                        .append(expense.get("created_at"))
                        .append("\n\n");
            }

            return result.toString();

        } catch (Exception e) {
            return "Unable to get recent expenses: " + e.getMessage();
        }
    }


    // =========================================================
    // 5. SAVE TASK
    // =========================================================

    @Tool(description = "Add a new task to the user's task list")
    public String saveTask(String task) {

        String sql =
                "INSERT INTO tasks (task, status, created_at) " +
                "VALUES (?, 'PENDING', NOW())";

        try {

            jdbcTemplate.update(sql, task);

            return "I have added the task \""
                    + task
                    + "\" to your task list.";

        } catch (Exception e) {
            return "Unable to save task: " + e.getMessage();
        }
    }


    // =========================================================
    // 6. GET TASKS
    // =========================================================

    @Tool(description = "Get all tasks from the user's task list")
    public String getTasks() {

        String sql =
                "SELECT id, task, status, created_at " +
                "FROM tasks " +
                "ORDER BY created_at DESC";

        try {

            List<Map<String, Object>> tasks =
                    jdbcTemplate.queryForList(sql);

            if (tasks.isEmpty()) {
                return "You have no tasks.";
            }

            StringBuilder result =
                    new StringBuilder("Your tasks:\n\n");

            for (Map<String, Object> task : tasks) {

                result.append("ID: ")
                        .append(task.get("id"))
                        .append("\n");

                result.append("Task: ")
                        .append(task.get("task"))
                        .append("\n");

                result.append("Status: ")
                        .append(task.get("status"))
                        .append("\n");

                result.append("Created: ")
                        .append(task.get("created_at"))
                        .append("\n\n");
            }

            return result.toString();

        } catch (Exception e) {
            return "Unable to get tasks: " + e.getMessage();
        }
    }


    // =========================================================
    // 7. MARK TASK COMPLETED
    // =========================================================

    @Tool(description = "Mark a task as completed using its task ID")
    public String markTaskCompleted(int id) {

        String sql =
                "UPDATE tasks " +
                "SET status = 'COMPLETED' " +
                "WHERE id = ?";

        try {

            int rows =
                    jdbcTemplate.update(sql, id);

            if (rows == 0) {
                return "No task found with ID " + id + ".";
            }

            return "Task "
                    + id
                    + " has been marked as completed.";

        } catch (Exception e) {
            return "Unable to complete task: " + e.getMessage();
        }
    }


    // =========================================================
    // 8. TODAY'S SUMMARY
    // =========================================================

    @Tool(description = "Get today's summary including study hours, total expenses, pending tasks and completed tasks")
    public String getTodaySummary() {

        String studySql =
                "SELECT COALESCE(SUM(hours), 0) " +
                "FROM study_progress " +
                "WHERE DATE(created_at) = CURDATE()";

        String expenseSql =
                "SELECT COALESCE(SUM(amount), 0) " +
                "FROM expenses " +
                "WHERE DATE(created_at) = CURDATE()";

        String pendingSql =
                "SELECT COUNT(*) " +
                "FROM tasks " +
                "WHERE status = 'PENDING'";

        String completedSql =
                "SELECT COUNT(*) " +
                "FROM tasks " +
                "WHERE status = 'COMPLETED'";

        try {

            Double studyHours =
                    jdbcTemplate.queryForObject(
                            studySql,
                            Double.class
                    );

            Double totalExpenses =
                    jdbcTemplate.queryForObject(
                            expenseSql,
                            Double.class
                    );

            Long pendingTasks =
                    jdbcTemplate.queryForObject(
                            pendingSql,
                            Long.class
                    );

            Long completedTasks =
                    jdbcTemplate.queryForObject(
                            completedSql,
                            Long.class
                    );

            return "Today's Summary:\n"
                    + "Study Hours: " + studyHours + "\n"
                    + "Total Expenses: ₹" + totalExpenses + "\n"
                    + "Pending Tasks: " + pendingTasks + "\n"
                    + "Completed Tasks: " + completedTasks;

        } catch (Exception e) {

            return "Unable to get today's summary: "
                    + e.getMessage();
        }
    }
}
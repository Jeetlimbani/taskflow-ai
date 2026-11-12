
import { useState, useEffect } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiAlertCircle,
  FiClipboard,
} from "react-icons/fi";

import { getAllTasks } from "../services/taskService";

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch tasks from backend
  const fetchTasks = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAllTasks();

      if (response.success) {
        setTasks(response.tasks);
      } else {
        setError("Unable to fetch tasks.");
      }
    } catch (error) {
      setError(
        error.message || "Something went wrong while fetching tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks when component loads
  useEffect(() => {
    fetchTasks();
  }, []);

  // Separate pending and completed tasks
  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  // Reusable task card
  const renderTask = (task) => (
    <div
      key={task._id}
      className="bg-gray-800 border border-gray-700 rounded-xl p-3 sm:p-4"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base sm:text-lg wrap-break-words">
            {task.title}
          </h3>

          <p className="text-gray-400 text-sm mt-1 wrap-break-words whitespace-pre-wrap">
            {task.description || "No description"}
          </p>
        </div>

        <span
          className={`self-start shrink-0 text-xs px-3 py-1 rounded-full ${
            task.completed
              ? "bg-green-900 text-green-300"
              : "bg-yellow-900 text-yellow-300"
          }`}
        >
          {task.completed ? "Completed" : "Pending"}
        </span>

      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 px-4">

        <FiRefreshCw
          size={30}
          className="animate-spin text-blue-500 mb-4"
        />

        <p className="text-sm sm:text-base">
          Loading your tasks...
        </p>

      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-8">

        <FiAlertCircle
          size={40}
          className="text-red-400 mb-4"
        />

        <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">
          Unable to Load Tasks
        </h2>

        <p className="text-sm sm:text-base text-gray-400 mb-5 wrap-break-words">
          {error}
        </p>

        <button
          onClick={fetchTasks}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          <FiRefreshCw size={16} />
          Try Again
        </button>

      </div>
    );
  }

  return (
    <div className="w-full min-w-0 p-4 sm:p-6 md:p-8 text-white">

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">
          My Tasks
        </h1>

        <p className="text-sm sm:text-base text-gray-400 mt-2">
          Manage and track your daily tasks.
        </p>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <FiClock className="text-yellow-400 shrink-0" size={22} />

            <div>
              <p className="text-gray-400 text-sm">
                Pending Tasks
              </p>

              <h2 className="text-2xl font-bold">
                {pendingTasks.length}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="text-green-400 shrink-0" size={22} />

            <div>
              <p className="text-gray-400 text-sm">
                Completed Tasks
              </p>

              <h2 className="text-2xl font-bold">
                {completedTasks.length}
              </h2>
            </div>
          </div>
        </div>

      </div>

      {/* Empty State */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12 sm:py-16 px-3">

          <FiClipboard
            size={48}
            className="text-gray-500 mb-4"
          />

          <h2 className="text-lg sm:text-xl font-semibold mb-2">
            No Tasks Yet
          </h2>

          <p className="text-sm sm:text-base text-gray-400">
            Ask TaskFlow AI to create your first task!
          </p>

        </div>
      ) : (
        <>
          {/* Pending Tasks */}
          <section className="mb-8 sm:mb-10">

            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Pending Tasks
            </h2>

            {pendingTasks.length === 0 ? (
              <p className="text-sm sm:text-base text-gray-400">
                No pending tasks. Great job!
              </p>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map(renderTask)}
              </div>
            )}

          </section>

          {/* Completed Tasks */}
          <section>

            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Completed Tasks
            </h2>

            {completedTasks.length === 0 ? (
              <p className="text-sm sm:text-base text-gray-400">
                No completed tasks yet.
              </p>
            ) : (
              <div className="space-y-3">
                {completedTasks.map(renderTask)}
              </div>
            )}

          </section>
        </>
      )}

    </div>
  );
}

export default TaskList;

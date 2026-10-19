
import { useMemo, useState } from "react";
import "./Tasks.css";

function getTodayISO() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export default function Tasks({
  projects = [],
  tasks = [],
  onTasksChange = () => {},
  selectedProjectId = "",
}) {
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState(selectedProjectId);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const today = getTodayISO();

  const normalizedTasks = tasks.map((task) => ({
    ...task,
    title: task.title ?? task.text ?? "Untitled task",
    completed: task.completed ?? task.done ?? false,
    projectName:
      task.projectName ??
      projects.find((project) => project.id === task.projectId)?.name ??
      "Personal",
    dueDate: task.dueDate ?? "",
    priority: task.priority ?? "Medium",
  }));

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedTasks
      .filter((task) => {
        const matchesSearch =
          task.title.toLowerCase().includes(query) ||
          task.projectName.toLowerCase().includes(query);

        const matchesFilter =
          filter === "All" ||
          (filter === "Active" && !task.completed) ||
          (filter === "Completed" && task.completed) ||
          (filter === "Overdue" &&
            !task.completed &&
            task.dueDate &&
            task.dueDate < today);

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) {
          return Number(a.completed) - Number(b.completed);
        }

        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [tasks, projects, filter, search, today]);

  const completedCount = normalizedTasks.filter(
    (task) => task.completed
  ).length;

  const overdueCount = normalizedTasks.filter(
    (task) =>
      !task.completed && task.dueDate && task.dueDate < today
  ).length;

  function addTask(event) {
    event.preventDefault();

    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const project = projects.find((item) => item.id === projectId);

    const newTask = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      text: cleanTitle,
      projectId: project?.id ?? "",
      projectName: project?.name ?? "Personal",
      dueDate,
      priority,
      completed: false,
      done: false,
      createdAt: new Date().toISOString(),
    };

    onTasksChange([newTask, ...tasks]);
    setTitle("");
    setDueDate("");
    setPriority("Medium");
  }

  function toggleTask(taskId) {
    onTasksChange(
      normalizedTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              done: !task.completed,
            }
          : task
      )
    );
  }

  function deleteTask(taskId) {
    onTasksChange(tasks.filter((task) => task.id !== taskId));
  }

  return (
    <section className="tasks-page">
      <header className="tasks-header">
        <div>
          <p className="tasks-eyebrow">CONNECTED WORKSPACE</p>
          <h1>Tasks &amp; Deadlines</h1>
          <p>Every task stays connected to its project and memory.</p>
        </div>
      </header>

      <div className="tasks-stats">
        <article className="task-stat">
          <span>Total tasks</span>
          <strong>{normalizedTasks.length}</strong>
        </article>

        <article className="task-stat">
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </article>

        <article className="task-stat">
          <span>Overdue</span>
          <strong>{overdueCount}</strong>
        </article>
      </div>

      <form className="task-form" onSubmit={addTask}>
        <h2>Create a task</h2>

        <label htmlFor="task-title">Task name</label>
        <input
          id="task-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Implement project memory search"
          maxLength={180}
          required
        />

        <div className="task-form-grid">
          <div>
            <label htmlFor="task-project">Linked project</label>
            <select
              id="task-project"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
            >
              <option value="">Personal task</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-date">Due date</label>
            <input
              id="task-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
        </div>

        <button className="task-add-button" type="submit">
          + Add task
        </button>
      </form>

      <div className="task-list-header">
        <div>
          <h2>Your tasks</h2>
          <p>{visibleTasks.length} tasks shown</p>
        </div>

        <input
          className="task-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search tasks or projects..."
          aria-label="Search tasks or projects"
        />
      </div>

      <div className="task-filters">
        {["All", "Active", "Completed", "Overdue"].map((item) => (
          <button
            type="button"
            key={item}
            className={filter === item ? "active" : ""}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="task-list">
        {visibleTasks.length === 0 ? (
          <div className="task-empty">
            <span>✓</span>
            <h3>No tasks found</h3>
            <p>Add a task or change your current filters.</p>
          </div>
        ) : (
          visibleTasks.map((task) => {
            const overdue =
              !task.completed && task.dueDate && task.dueDate < today;

            return (
              <article
                className={`task-row ${
                  task.completed ? "is-complete" : ""
                }`}
                key={task.id}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  aria-label={`Mark ${task.title} as ${
                    task.completed ? "active" : "completed"
                  }`}
                />

                <div className="task-row-content">
                  <strong>{task.title}</strong>

                  <div className="task-meta">
                    <span>{task.projectName}</span>

                    {task.dueDate && (
                      <span className={overdue ? "task-overdue" : ""}>
                        {overdue ? "Overdue · " : "Due · "}
                        {task.dueDate}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`task-priority priority-${task.priority.toLowerCase()}`}
                >
                  {task.priority}
                </span>

                <button
                  type="button"
                  className="task-delete"
                  onClick={() => deleteTask(task.id)}
                  aria-label={`Delete ${task.title}`}
                  title="Delete task"
                >
                  ×
                </button>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

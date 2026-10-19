
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import ProjectMemory from "./ProjectMemory";
import Tasks from "./Tasks";

const initialProjects = [
  {
    id: "contextos",
    name: "ContextOS",
    description: "Your personal project memory workspace.",
    status: "In progress",
    progress: 35,
    color: "purple",
    updated: "Just now",
  },
  {
    id: "horror-game",
    name: "Indie Horror Game",
    description: "A multiplayer horror game for Steam.",
    status: "Planning",
    progress: 15,
    color: "cyan",
    updated: "Yesterday",
  },
  {
    id: "study-assistant",
    name: "AI Study Assistant",
    description: "A smarter way to organize learning.",
    status: "In progress",
    progress: 60,
    color: "orange",
    updated: "2 days ago",
  },
];

const initialTasks = [
  {
    id: "task-1",
    text: "Finish the ContextOS UI",
    title: "Finish the ContextOS UI",
    done: false,
    completed: false,
    projectId: "contextos",
    projectName: "ContextOS",
    priority: "High",
  },
  {
    id: "task-2",
    text: "Organize project notes",
    title: "Organize project notes",
    done: false,
    completed: false,
    projectId: "contextos",
    projectName: "ContextOS",
    priority: "Medium",
  },
  {
    id: "task-3",
    text: "Test the prototype",
    title: "Test the prototype",
    done: true,
    completed: true,
    projectId: "contextos",
    projectName: "ContextOS",
    priority: "Low",
  },
];

const navigation = [
  { name: "Dashboard", icon: "◫" },
  { name: "My Projects", icon: "▦" },
  { name: "Project Workspace", icon: "⌘" },
  { name: "Resume Briefing", icon: "↗" },
  { name: "Notes and Decisions", icon: "▤" },
  { name: "Tasks", icon: "✓" },
  { name: "Settings", icon: "⚙" },
];

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch {
    return fallback;
  }
}

function normalizeTask(task, projects = []) {
  const project = projects.find((item) => item.id === task.projectId);
  const title = task.title ?? task.text ?? "";
  const completed = task.completed ?? task.done ?? false;

  return {
    ...task,
    title,
    text: title,
    completed,
    done: completed,
    projectName: task.projectName ?? project?.name ?? "Personal",
    priority: task.priority ?? "Medium",
    dueDate: task.dueDate ?? "",
  };
}

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [search, setSearch] = useState("");

  const [projects, setProjects] = useState(() => {
    const saved = readStorage("contextos-projects", null);

    if (!Array.isArray(saved)) {
      return initialProjects;
    }

    const savedIds = new Set(saved.map((project) => project.id));
    const missingDefaults = initialProjects.filter(
      (project) => !savedIds.has(project.id)
    );

    return [...saved, ...missingDefaults];
  });

  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    const saved = readStorage("contextos-selected-project", "contextos");
    return saved || "contextos";
  });

  const [notes, setNotes] = useState(() => {
    const saved = readStorage("contextos-notes", []);
    return Array.isArray(saved) ? saved : [];
  });

  const [tasks, setTasks] = useState(() => {
    const saved = readStorage("contextos-tasks", initialTasks);
    const list = Array.isArray(saved) ? saved : initialTasks;

    return list.map((task) => normalizeTask(task));
  });

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState("Note");

  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ??
    projects[0] ??
    null;

  // Keep existing localStorage data and save updates centrally.
  useEffect(() => {
    localStorage.setItem("contextos-projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("contextos-notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("contextos-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(
      "contextos-selected-project",
      JSON.stringify(selectedProjectId)
    );
  }, [selectedProjectId]);

  // Keep task fields compatible with both the old dashboard and new Tasks page.
  function updateTasks(updater) {
    setTasks((current) => {
      const updated =
        typeof updater === "function" ? updater(current) : updater;

      return updated.map((task) => normalizeTask(task, projects));
    });
  }

  function openPage(name) {
    setPage(name);
  }

  function selectProject(id) {
    setSelectedProjectId(id);
    setPage("Project Workspace");
  }

  function addProject(event) {
    event.preventDefault();

    const name = projectName.trim();
    if (!name) return;

    const newProject = {
      id: `project-${Date.now()}`,
      name,
      description: projectDescription.trim() || "A new project.",
      status: "Planning",
      progress: 0,
      color: "purple",
      updated: "Just now",
    };

    setProjects((current) => [...current, newProject]);
    setSelectedProjectId(newProject.id);
    setProjectName("");
    setProjectDescription("");
    setPage("Project Workspace");
  }

  function saveNote(event) {
    event.preventDefault();

    if (!selectedProject || !noteTitle.trim() || !noteContent.trim()) {
      return;
    }

    const newNote = {
      id: `note-${Date.now()}`,
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      title: noteTitle.trim(),
      content: noteContent.trim(),
      type: noteType,
      createdAt: new Date().toISOString(),
    };

    setNotes((current) => [newNote, ...current]);
    setNoteTitle("");
    setNoteContent("");
    setNoteType("Note");
  }

  function deleteNote(noteId) {
    setNotes((current) =>
      current.filter((note) => note.id !== noteId)
    );
  }

  function toggleTask(taskId) {
    updateTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;

        const completed = !(task.completed ?? task.done ?? false);

        return {
          ...task,
          completed,
          done: completed,
        };
      })
    );
  }

  const selectedNotes = useMemo(
    () =>
      notes.filter(
        (note) => note.projectId === selectedProject?.id
      ),
    [notes, selectedProject]
  );

  const selectedTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.projectId === selectedProject?.id
      ),
    [tasks, selectedProject]
  );

  const allSearchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];

    const matchedProjects = projects
      .filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          (project.description || "").toLowerCase().includes(query)
      )
      .map((project) => ({
        id: project.id,
        type: "Project",
        title: project.name,
        detail: project.description,
        action: () => selectProject(project.id),
      }));

    const matchedNotes = notes
      .filter(
        (note) =>
          (note.title || "").toLowerCase().includes(query) ||
          (note.content || "").toLowerCase().includes(query) ||
          (note.projectName || "").toLowerCase().includes(query)
      )
      .map((note) => ({
        id: note.id,
        type: note.type || "Note",
        title: note.title || "Untitled note",
        detail: note.projectName || "Unassigned project",
        action: () => {
          if (note.projectId) {
            setSelectedProjectId(note.projectId);
          }
          setPage("Notes and Decisions");
        },
      }));

    const matchedTasks = tasks
      .filter(
        (task) =>
          (task.title || task.text || "").toLowerCase().includes(query) ||
          (task.projectName || "").toLowerCase().includes(query)
      )
      .map((task) => ({
        id: task.id,
        type: "Task",
        title: task.title || task.text || "Untitled task",
        detail: task.projectName || "Personal",
        action: () => {
          if (task.projectId) setSelectedProjectId(task.projectId);
          setPage("Tasks");
        },
      }));

    return [...matchedProjects, ...matchedNotes, ...matchedTasks];
  }, [search, projects, notes, tasks]);

  const completedCount = tasks.filter(
    (task) => task.completed ?? task.done
  ).length;

  const openTaskCount = tasks.length - completedCount;

  const projectNoteCount = notes.filter(
    (note) => note.projectId === selectedProject?.id
  ).length;

  const projectTaskCount = tasks.filter(
    (task) => task.projectId === selectedProject?.id
  ).length;

  const projectBriefing = selectedNotes.filter((note) =>
    ["Decision", "Problem", "Next action"].includes(note.type)
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">

<button
  className="brand"
  type="button"
  onClick={() => openPage("Dashboard")}
>
  <span className="brand-mark" aria-hidden="true">
    <svg
      viewBox="0 0 40 40"
      width="40"
      height="40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="12" fill="#8B5CF6" />
      <path
        d="M27 12H19C13.5 12 10 15.5 10 21C10 26.5 13.5 30 19 30H27V25H19C16.2 25 15 23.5 15 21C15 18.5 16.2 17 19 17H27V12Z"
        fill="white"
      />
      <circle cx="27" cy="21" r="3" fill="#C4B5FD" />
    </svg>
  </span>
  <span>
    <strong>ContextOS</strong>
    <small>Personal project memory</small>
  </span>
</button>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`nav-item ${page === item.name ? "active" : ""}`}
              onClick={() => openPage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-project-heading">
          <span className="sidebar-label">YOUR PROJECTS</span>
          <button
            type="button"
            className="icon-button"
            title="Create a project"
            onClick={() => openPage("My Projects")}
          >
            +
          </button>
        </div>

        <div className="sidebar-projects">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              className={`sidebar-project ${
                selectedProject?.id === project.id ? "active" : ""
              }`}
              onClick={() => selectProject(project.id)}
            >
              <span className={`project-dot ${project.color || "purple"}`} />
              <span>{project.name}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <span className="status-indicator" />
          <span>Local workspace</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>ContextOS</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{page}</strong>
          </div>

          <div className="topbar-actions">
            <label className="global-search">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects, notes, tasks..."
                aria-label="Search all projects, notes, and tasks"
              />
              <kbd>Search</kbd>
            </label>
          </div>
        </header>

        {search.trim() && (
          <section className="search-results panel">
            <div className="panel-heading">
              <div>
                <h2>Search results</h2>
                <p>{allSearchResults.length} matching items</p>
              </div>
              <button
                className="text-button"
                type="button"
                onClick={() => setSearch("")}
              >
                Clear search
              </button>
            </div>

            {allSearchResults.length === 0 ? (
              <p className="empty-state">No matching projects, notes, or tasks.</p>
            ) : (
              allSearchResults.map((result) => (
                <button
                  type="button"
                  className="search-result"
                  key={`${result.type}-${result.id}`}
                  onClick={() => {
                    result.action();
                    setSearch("");
                  }}
                >
                  <span className="search-result-type">{result.type}</span>
                  <span>
                    <strong>{result.title}</strong>
                    <small>{result.detail}</small>
                  </span>
                  <span>→</span>
                </button>
              ))
            )}
          </section>
        )}

        {!search.trim() && page === "Dashboard" && (
          <div className="page-content">
            <section className="welcome-section">
              <div>
                <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
                <h1>Welcome back.</h1>
                <p className="muted">
                  Your projects, decisions, and next steps in one place.
                </p>
              </div>
              <button
                type="button"
                className="primary-button"
                onClick={() => openPage("My Projects")}
              >
                + New project
              </button>
            </section>

            <section className="stats-grid">
              <article className="stat-card panel">
                <span>Active projects</span>
                <strong>{projects.length}</strong>
                <small>Across your workspace</small>
              </article>
              <article className="stat-card panel">
                <span>Saved memories</span>
                <strong>{notes.length}</strong>
                <small>Notes, decisions, and ideas</small>
              </article>
              <article className="stat-card panel">
                <span>Open tasks</span>
                <strong>{openTaskCount}</strong>
                <small>{completedCount} completed</small>
              </article>
            </section>

            <section className="dashboard-grid">
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Your projects</h2>
                    <p>Continue where you left off.</p>
                  </div>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => openPage("My Projects")}
                  >
                    View all →
                  </button>
                </div>

                <div className="project-card-list">
                  {projects.slice(0, 4).map((project) => (
                    <button
                      type="button"
                      className="project-card"
                      key={project.id}
                      onClick={() => selectProject(project.id)}
                    >
                      <span className={`project-symbol ${project.color || "purple"}`}>
                        {project.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="project-card-main">
                        <strong>{project.name}</strong>
                        <small>{project.description}</small>
                        <span className="progress-track">
                          <span
                            className="progress-fill"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, Number(project.progress) || 0)
                              )}%`,
                            }}
                          />
                        </span>
                      </span>
                      <span className="project-progress">
                        {project.progress || 0}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Next actions</h2>
                    <p>Small steps move projects forward.</p>
                  </div>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => openPage("Tasks")}
                  >
                    All tasks →
                  </button>
                </div>

                {tasks.filter((task) => !task.completed).slice(0, 5).length === 0 ? (
                  <p className="empty-state">You're all caught up. Add a task to get started.</p>
                ) : (
                  tasks
                    .filter((task) => !task.completed)
                    .slice(0, 5)
                    .map((task) => (
                      <label className="task-item" key={task.id}>
                        <input
                          type="checkbox"
                          checked={Boolean(task.completed)}
                          onChange={() => toggleTask(task.id)}
                        />
                        <span>{task.title || task.text}</span>
                      </label>
                    ))
                )}
              </div>
            </section>

            <section className="panel quick-actions-panel">
              <div className="panel-heading">
                <div>
                  <h2>Quick actions</h2>
                  <p>Capture information before you forget it.</p>
                </div>
              </div>
              <div className="quick-actions">
                <button type="button" onClick={() => openPage("Project Workspace")}>
                  <span>⌘</span>
                  <strong>Open workspace</strong>
                  <small>Review a project</small>
                </button>
                <button type="button" onClick={() => openPage("Notes and Decisions")}>
                  <span>▤</span>
                  <strong>Capture a memory</strong>
                  <small>Save a note or decision</small>
                </button>
                <button type="button" onClick={() => openPage("Tasks")}>
                  <span>✓</span>
                  <strong>Add a task</strong>
                  <small>Track your next action</small>
                </button>
              </div>
            </section>
          </div>
        )}

        {!search.trim() && page === "My Projects" && (
          <div className="page-content">
            <section className="welcome-section">
              <div>
                <p className="eyebrow">PROJECT ORGANIZATION</p>
                <h1>My Projects</h1>
                <p className="muted">Keep every project and its context together.</p>
              </div>
            </section>

            <form className="panel project-create-form" onSubmit={addProject}>
              <h2>Create a project</h2>
              <label htmlFor="project-name">Project name</label>
              <input
                id="project-name"
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="e.g. Portfolio website"
                required
                maxLength={100}
              />
              <label htmlFor="project-description">Description</label>
              <textarea
                id="project-description"
                value={projectDescription}
                onChange={(event) => setProjectDescription(event.target.value)}
                placeholder="What are you building?"
                rows={3}
              />
              <button className="primary-button" type="submit">
                Create project
              </button>
            </form>

            <section className="project-grid">
              {projects.map((project) => {
                const projectNotes = notes.filter(
                  (note) => note.projectId === project.id
                );
                const projectTasks = tasks.filter(
                  (task) => task.projectId === project.id
                );

                return (
                  <article className="panel project-overview-card" key={project.id}>
                    <div className="project-card-top">
                      <span className={`project-symbol ${project.color || "purple"}`}>
                        {project.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="project-status">{project.status}</span>
                    </div>
                    <h2>{project.name}</h2>
                    <p>{project.description}</p>
                    <div className="project-card-counts">
                      <span>{projectNotes.length} memories</span>
                      <span>{projectTasks.length} tasks</span>
                    </div>
                    <div className="progress-track">
                      <span
                        className="progress-fill"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => selectProject(project.id)}
                    >
                      Open project →
                    </button>
                  </article>
                );
              })}
            </section>
          </div>
        )}

        {!search.trim() && page === "Project Workspace" && (
          <div className="page-content">
            {!selectedProject ? (
              <section className="panel">
                <h1>No project selected</h1>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => openPage("My Projects")}
                >
                  Choose a project
                </button>
              </section>
            ) : (
              <>
                <section className="welcome-section">
                  <div>
                    <p className="eyebrow">PROJECT WORKSPACE</p>
                    <h1>{selectedProject.name}</h1>
                    <p className="muted">{selectedProject.description}</p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => openPage("Notes and Decisions")}
                  >
                    + Capture memory
                  </button>
                </section>

                <section className="stats-grid">
                  <article className="stat-card panel">
                    <span>Progress</span>
                    <strong>{selectedProject.progress || 0}%</strong>
                    <small>{selectedProject.status}</small>
                  </article>
                  <article className="stat-card panel">
                    <span>Memories</span>
                    <strong>{projectNoteCount}</strong>
                    <small>Notes and decisions</small>
                  </article>
                  <article className="stat-card panel">
                    <span>Tasks</span>
                    <strong>{projectTaskCount}</strong>
                    <small>
                      {selectedTasks.filter((task) => task.completed).length} completed
                    </small>
                  </article>
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Project memory</h2>
                      <p>Notes, decisions, problems, and next actions.</p>
                    </div>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => openPage("Notes and Decisions")}
                    >
                      Manage memories →
                    </button>
                  </div>

                  {selectedNotes.length === 0 ? (
                    <p className="empty-state">
                      No memories for this project yet. Save your first note or decision.
                    </p>
                  ) : (
                    selectedNotes.slice(0, 6).map((note) => (
                      <article className="workspace-memory" key={note.id}>
                        <div className="memory-card-top">
                          <span className="memory-type">
                            {note.type || "Note"}
                          </span>
                          <span className="muted">
                            {note.createdAt
                              ? new Date(note.createdAt).toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                        <h3>{note.title || "Untitled memory"}</h3>
                        <p>{note.content}</p>
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => deleteNote(note.id)}
                        >
                          Delete
                        </button>
                      </article>
                    ))
                  )}
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Project tasks</h2>
                      <p>
                        {selectedTasks.filter((task) => task.completed).length}
                        {" of "}
                        {selectedTasks.length} completed
                      </p>
                    </div>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => openPage("Tasks")}
                    >
                      Manage tasks →
                    </button>
                  </div>

                  {selectedTasks.length === 0 ? (
                    <p className="empty-state">
                      No tasks linked to this project yet. Open Tasks to create one
                      and assign it to this project.
                    </p>
                  ) : (
                    selectedTasks.map((task) => (
                      <label className="task-item" key={task.id}>
                        <input
                          type="checkbox"
                          checked={Boolean(task.completed)}
                          onChange={() => toggleTask(task.id)}
                        />
                        <span className={task.completed ? "task-done" : ""}>
                          {task.title || task.text}
                        </span>
                      </label>
                    ))
                  )}
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Resume briefing</h2>
                      <p>Useful context for your next work session.</p>
                    </div>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => openPage("Resume Briefing")}
                    >
                      Full briefing →
                    </button>
                  </div>

                  {projectBriefing.length === 0 ? (
                    <p className="empty-state">
                      Add a Decision, Problem, or Next action memory to build this briefing.
                    </p>
                  ) : (
                    projectBriefing.slice(0, 4).map((item) => (
                      <div className="briefing-item" key={item.id}>
                        <span className="memory-type">{item.type}</span>
                        <strong>{item.title}</strong>
                        <p>{item.content}</p>
                      </div>
                    ))
                  )}
                </section>
              </>
            )}
          </div>
        )}

        {!search.trim() && page === "Resume Briefing" && (
          <div className="page-content">
            <section className="welcome-section">
              <div>
                <p className="eyebrow">PICK UP WHERE YOU LEFT OFF</p>
                <h1>Resume Briefing</h1>
                <p className="muted">
                  A summary of important project context and unfinished work.
                </p>
              </div>
              {projects.length > 0 && (
                <select
                  value={selectedProject?.id || ""}
                  onChange={(event) => setSelectedProjectId(event.target.value)}
                  aria-label="Choose project for briefing"
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              )}
            </section>

            {selectedProject && (
              <>
                <section className="panel">
                  <h2>{selectedProject.name}</h2>
                  <p>{selectedProject.description}</p>
                  <p>
                    Status: <strong>{selectedProject.status}</strong>
                    {" · "}
                    Progress: <strong>{selectedProject.progress || 0}%</strong>
                  </p>
                </section>

                <section className="panel">
                  <h2>Important context</h2>
                  {projectBriefing.length === 0 ? (
                    <p className="empty-state">
                      No decisions, problems, or next actions have been recorded yet.
                    </p>
                  ) : (
                    projectBriefing.map((item) => (
                      <article className="briefing-item" key={item.id}>
                        <span className="memory-type">{item.type}</span>
                        <h3>{item.title}</h3>
                        <p>{item.content}</p>
                      </article>
                    ))
                  )}
                </section>

                <section className="panel">
                  <h2>Unfinished tasks</h2>
                  {selectedTasks.filter((task) => !task.completed).length === 0 ? (
                    <p className="empty-state">No unfinished tasks for this project.</p>
                  ) : (
                    selectedTasks
                      .filter((task) => !task.completed)
                      .map((task) => (
                        <label className="task-item" key={task.id}>
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={() => toggleTask(task.id)}
                          />
                          <span>{task.title || task.text}</span>
                        </label>
                      ))
                  )}
                </section>
              </>
            )}
          </div>
        )}

        {!search.trim() && page === "Notes and Decisions" && (
          <div className="page-content">
            <ProjectMemory
              projects={projects}
              memories={notes}
              onMemoriesChange={setNotes}
            />

            <section className="panel quick-note-panel">
              <div className="panel-heading">
                <div>
                  <h2>Quick capture</h2>
                  <p>Save a new memory directly to the selected project.</p>
                </div>
              </div>

              <form className="quick-note-form" onSubmit={saveNote}>
                <label htmlFor="note-project">Project</label>
                <select
                  id="note-project"
                  value={selectedProject?.id || ""}
                  onChange={(event) => setSelectedProjectId(event.target.value)}
                  required
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>

                <label htmlFor="note-type">Memory type</label>
                <select
                  id="note-type"
                  value={noteType}
                  onChange={(event) => setNoteType(event.target.value)}
                >
                  <option>Note</option>
                  <option>Decision</option>
                  <option>Problem</option>
                  <option>Next action</option>
                  <option>Idea</option>
                  <option>Research</option>
                  <option>Meeting</option>
                </select>

                <label htmlFor="note-title">Title</label>
                <input
                  id="note-title"
                  value={noteTitle}
                  onChange={(event) => setNoteTitle(event.target.value)}
                  placeholder="What should you remember?"
                  maxLength={180}
                  required
                />

                <label htmlFor="note-content">Details</label>
                <textarea
                  id="note-content"
                  value={noteContent}
                  onChange={(event) => setNoteContent(event.target.value)}
                  placeholder="Write the context, decision, or next step..."
                  rows={4}
                  required
                />

                <button className="primary-button" type="submit">
                  Save memory
                </button>
              </form>
            </section>
          </div>
        )}

        {!search.trim() && page === "Tasks" && (
          <div className="page-content">
            <Tasks
              projects={projects}
              tasks={tasks}
              onTasksChange={updateTasks}
              selectedProjectId={selectedProject?.id ?? ""}
            />
          </div>
        )}

        {!search.trim() && page === "Settings" && (
          <div className="page-content">
            <section className="welcome-section">
              <div>
                <p className="eyebrow">PREFERENCES</p>
                <h1>Settings</h1>
                <p className="muted">
                  Manage your local workspace and keep your data portable.
                </p>
              </div>
            </section>

            <section className="panel settings-section">
              <h2>Workspace</h2>
              <p>
                ContextOS currently stores your projects, notes, and tasks in this
                browser's local storage.
              </p>
              <p>
                Your projects: <strong>{projects.length}</strong>
                {" · "}
                Memories: <strong>{notes.length}</strong>
                {" · "}
                Tasks: <strong>{tasks.length}</strong>
              </p>
            </section>

            <section className="panel settings-section">
              <h2>Export your data</h2>
              <p>Download a JSON backup of your current workspace.</p>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  const backup = {
                    app: "ContextOS",
                    exportedAt: new Date().toISOString(),
                    projects,
                    notes,
                    tasks,
                  };

                  const blob = new Blob(
                    [JSON.stringify(backup, null, 2)],
                    { type: "application/json" }
                  );

                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `contextos-backup-${new Date()
                    .toISOString()
                    .slice(0, 10)}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export workspace backup
              </button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

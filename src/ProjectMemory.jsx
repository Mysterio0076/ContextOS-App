
import { useMemo, useState } from "react";
import "./ProjectMemory.css";

const categories = [
  "Note",
  "Decision",
  "Problem",
  "Solution",
  "Research",
  "Meeting",
  "Next action",
];

export default function ProjectMemory({
  projects = [],
  memories = [],
  onMemoriesChange = () => {},
}) {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("Note");
  const [projectId, setProjectId] = useState("");

  const visibleMemories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return memories.filter((memory) => {
      const project = projects.find(
        (item) => item.id === memory.projectId
      );

      const projectName =
        project?.name ?? memory.projectName ?? "Unassigned";

      const text =
        `${memory.title} ${memory.content} ${memory.type} ${projectName}`
          .toLowerCase();

      const matchesSearch = text.includes(query);
      const matchesProject =
        projectFilter === "all" ||
        memory.projectId === projectFilter;
      const matchesCategory =
        categoryFilter === "all" ||
        memory.type === categoryFilter;

      return matchesSearch && matchesProject && matchesCategory;
    });
  }, [memories, projects, search, projectFilter, categoryFilter]);

  function resetForm() {
    setTitle("");
    setContent("");
    setType("Note");
    setProjectId("");
    setEditingId(null);
    setShowForm(false);
  }

  function startEditing(memory) {
    setEditingId(memory.id);
    setTitle(memory.title ?? "");
    setContent(memory.content ?? "");
    setType(memory.type ?? "Note");
    setProjectId(memory.projectId ?? "");
    setShowForm(true);
  }

  function saveMemory(event) {
    event.preventDefault();

    if (!title.trim()) return;

    const project = projects.find(
      (item) => item.id === projectId
    );

    const existing = memories.find(
      (memory) => memory.id === editingId
    );

    const memory = {
      ...existing,
      id: editingId ?? `memory-${Date.now()}`,
      projectId: project?.id ?? "",
      projectName: project?.name ?? "Personal",
      title: title.trim(),
      content: content.trim(),
      type,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedMemories = editingId
      ? memories.map((item) =>
          item.id === editingId ? memory : item
        )
      : [memory, ...memories];

    onMemoriesChange(updatedMemories);
    resetForm();
  }

  function deleteMemory(id) {
    if (!window.confirm("Delete this memory item?")) return;

    onMemoriesChange(
      memories.filter((memory) => memory.id !== id)
    );
  }

  function exportMemories() {
    const blob = new Blob(
      [JSON.stringify(visibleMemories, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "contextos-project-memory.json";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <section className="memory-page">
      <header className="memory-header">
        <div>
          <p className="memory-eyebrow">YOUR KNOWLEDGE BASE</p>
          <h1>Notes &amp; Decisions</h1>
          <p>
            Keep project context, decisions, problems, and next actions
            connected.
          </p>
        </div>

        <div className="memory-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={exportMemories}
          >
            Export JSON
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            + Add memory
          </button>
        </div>
      </header>

      <div className="memory-summary-grid">
        <article className="panel">
          <span>Total memories</span>
          <strong>{memories.length}</strong>
        </article>

        <article className="panel">
          <span>Decisions</span>
          <strong>
            {memories.filter((item) => item.type === "Decision").length}
          </strong>
        </article>

        <article className="panel">
          <span>Open problems</span>
          <strong>
            {memories.filter((item) => item.type === "Problem").length}
          </strong>
        </article>
      </div>

      <div className="memory-filters">
        <input
          className="page-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search notes, decisions, and projects..."
        />

        <select
          value={projectFilter}
          onChange={(event) => setProjectFilter(event.target.value)}
          aria-label="Filter by project"
        >
          <option value="all">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <form className="panel memory-form" onSubmit={saveMemory}>
          <h2>{editingId ? "Edit memory" : "Create memory"}</h2>

          <label htmlFor="memory-title">Title</label>
          <input
            id="memory-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What should you remember?"
            required
          />

          <div className="memory-form-grid">
            <div>
              <label htmlFor="memory-project">Linked project</label>
              <select
                id="memory-project"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
              >
                <option value="">Personal / unassigned</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="memory-category">Category</label>
              <select
                id="memory-category"
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label htmlFor="memory-content">Details</label>
          <textarea
            id="memory-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Record the reasoning, context, or next step..."
            rows={5}
          />

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
            >
              Cancel
            </button>

            <button type="submit" className="primary-button">
              {editingId ? "Save changes" : "Save memory"}
            </button>
          </div>
        </form>
      )}

      <div className="memory-list">
        {visibleMemories.length === 0 ? (
          <div className="panel memory-empty">
            <h2>No matching memories</h2>
            <p>
              Add a memory or adjust the project, category, and search
              filters.
            </p>
          </div>
        ) : (
          visibleMemories.map((memory) => {
            const project = projects.find(
              (item) => item.id === memory.projectId
            );

            return (
              <article className="panel memory-card" key={memory.id}>
                <div className="memory-card-top">
                  <span className="note-type">
                    {memory.type || "Note"}
                  </span>

                  <span className="memory-project-name">
                    {project?.name ?? memory.projectName ?? "Personal"}
                  </span>
                </div>

                <h3>{memory.title}</h3>

                <p className="memory-content">
                  {memory.content || "No additional details."}
                </p>

                <div className="memory-card-footer">
                  <span>
                    {memory.updatedAt
                      ? `Updated ${new Date(
                          memory.updatedAt
                        ).toLocaleDateString()}`
                      : memory.createdAt
                        ? new Date(
                            memory.createdAt
                          ).toLocaleDateString()
                        : "Saved memory"}
                  </span>

                  <div>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => startEditing(memory)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="text-button"
                      onClick={() => deleteMemory(memory.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

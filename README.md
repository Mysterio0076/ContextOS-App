# ContextOS

**Your personal project memory workspace.**

ContextOS is a local-first workspace designed to help you organize projects, notes, decisions, and tasks in one place. It helps you keep track of your work and quickly return to where you left off.

## Features

- **Project Dashboard** — View and organize your projects.
- **Project Workspaces** — Create, edit, and manage individual projects.
- **Notes & Decisions** — Keep important information and project memories together.
- **Task Management** — Create, edit, complete, and delete tasks.
- **Global Search** — Find relevant information across your workspace.
- **Resume Briefing** — Review project information to get back into your workflow.
- **Local-First Storage** — Keep application data in your browser's local storage.
- **JSON Backup Export** — Export your data for safekeeping.

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- Browser `localStorage`

## Getting Started

### Prerequisites

Install [Node.js](https://nodejs.org/) and Git before continuing.

### Installation

Clone the repository:

```bash
git clone https://github.com/Mysterio0076/ContextOS-App.git
cd ContextOS-App
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Data & Privacy

ContextOS currently stores application data in your browser's `localStorage`.

- Data is specific to the browser and origin where it was created.
- Clearing browser site data can permanently remove locally stored information.
- Data does not automatically synchronize across devices.
- Export backups regularly and store them somewhere safe.

**Important:** This early version should not be your only storage location for critical information.

## Project Status

ContextOS is under active development. Core workflows have been manually tested by the developer, but broader testing is still needed.

AI integration, cloud synchronization, hosted accounts, collaboration, and paid subscriptions are not included in this version.

## Roadmap

- [ ] Safe JSON import and data restoration
- [ ] Improved backup and recovery workflow
- [ ] Responsive UI improvements
- [ ] Automated testing
- [ ] First public release: `v0.1.0`
- [ ] Evaluate future AI and cloud features

## Contributing

Bug reports, suggestions, and contributions are welcome. When reporting a bug, include the steps to reproduce it and what you expected to happen.

## License

ContextOS is distributed under the [MIT License](LICENSE).

---

Built independently as an evolving project. Contributions and feedback are welcome.
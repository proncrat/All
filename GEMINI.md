# Project Overview

This is a boilerplate project for a single-page application built with React and TypeScript. It uses Vite for the development server and build process. Routing is handled by React Router.

## Key Technologies

*   **React:** A JavaScript library for building user interfaces.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **Vite:** A fast build tool and development server for modern web projects.
*   **React Router:** A library for declarative routing in React applications.
*   **ESLint:** A tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
*   **Vitest:** A testing framework for Vite projects.

## Project Structure

*   `client/`: Contains the client-side source code.
    *   `components/`: React components.
    *   `index.tsx`: The main entry point for the React application.
    *   `router.tsx`: Defines the application's routes using React Router.
*   `index.html`: The main HTML file for the application.
*   `package.json`: Defines the project's dependencies and scripts.
*   `vite.config.js`: Configuration file for Vite.
*   `tsconfig.json`: Configuration file for TypeScript.

## Building and Running

### Development

Prompt the user to run the development server themselves in a separate terminal window.

```bash
npm run dev
```

This will start the Vite development server, and you can view the application at `http://localhost:5173`.

### Building for Production

To create a production build, use the following command:

```bash
npm run build
```

This will create a `dist` folder with the optimized and minified assets for your application.

### Testing

This project uses Vitest for running unit tests. To execute the test suite, run:

```bash
npm test -- --run
```

## Development Conventions

### Linting and Formatting

This project uses ESLint for static code analysis and Prettier for code formatting. To check for linting errors, run:

```bash
npm run lint
```

To automatically format the code, use:

```bash
npm run format
```

## Development Conventions

*   The project uses functional components with hooks.
*   Styling is done with CSS, as seen in `main.css`.
*   The project follows the standard React project structure.
*   ESLint is configured to enforce a consistent coding style.

## PromptKit Quick Reference
- Review the available artefacts when the student requests them:
  - Protocol: `promptkit/protocols/setup.md` — instructions for updating these CLI briefings.
  - Workflow: `promptkit/workflows/tutor.md` — guide for tutoring/explanation sessions.
  - Workflow: `promptkit/workflows/reflect.md` — guide for documenting outcomes and next steps.
- Student notes live in `promptkit/notes/`; The table in `progress-journal.md` is main place to update with reflections. Instructor Activities are in `promptkit/activities/` (read-only).
- When new workflows arrive, expect additional files under `promptkit/workflows/`.
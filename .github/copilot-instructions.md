# Abyssal Workspace Copilot Instructions

This file provides workspace-specific instructions for GitHub Copilot in the Abyssal project. Follow these steps for consistent setup and development:

- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements
  - Project type, language, and frameworks are specified in README.md and server/client READMEs.
- [x] Scaffold the Project
  - Use vertical-slice architecture for all features.
  - Server: Node.js 22 LTS, TypeScript, Express, WebSockets, TypeORM.
  - Client: Angular 20 (when created).
- [x] Customize the Project
  - Each feature in its own folder with public entry (index.ts) and optional README.
  - Modular service and repository layers.
  - AI adapters scaffolded for future integration.
- [x] Install Required Extensions
  - Only install extensions specified in project setup info.
- [x] Compile the Project
  - Install missing dependencies.
  - Run diagnostics and resolve issues.
  - Refer to README.md for instructions.
- [x] Create and Run Task
  - Use tasks.json if needed for build/run tasks.
- [x] Launch the Project
  - Prompt for debug mode before launching.
- [x] Ensure Documentation is Complete
  - README.md and copilot-instructions.md must be up to date and reflect current project info.

Work through each checklist item systematically.
Keep communication concise and focused.
Follow development best practices.

# T4dWallet

## Project Description

**T4d Wallet System** is an open-source digital wallet application that allows users to manage and track their finances. It supports multiple currencies, transaction histories, and real-time balance updates. The goal of this project is to provide a simple, secure, and scalable solution for personal and business financial management.

### Features
- Create and manage multiple wallets.
- Support for multiple currencies.
- Track income and expenses with detailed transaction history.
- View real-time balance updates.
- Secure authentication and authorization mechanisms.
- API for integrating with external services.

---

## Installation
This project follows a monorepo structure, where both the backend (API) and frontend (UI) are housed in the same repository.

### Prerequisites
Before you begin, ensure you have the following:
- **Node.js** (v14 or higher)
- **Git**
- **MongoDB** 

### Clone the Repository
```bash
git clone https://github.com/pelumiadebayo/T4dWallet.git
cd T4dWallet
```


### Running the Backend

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install the dependencies:
```bash
npm install
```

3. Environment Setup:
Create a `.env` file in the root of the project and set the following environment variables:
```env
DATABASE_URL=mongodb://localhost:27017/T4dWallet
JWT_SECRET=your_secret_key
```

4. Start the backend server:
```bash
npm start
```

The backend should now be running, typically on port 5000.

### Running the Frontend
1. Navigate to the frontend folder:

```bash
cd frontend
```

2. Install the dependencies:
```bash
npm install
```

3. Start the frontend application:
```bash
npm start
```

The frontend should now be running, typically on port 3000.


## Usage

Once the application is up and running, you can:
- Register a new user and log in.
- Create, update, or delete wallets.
- Add transactions (income or expenses) to the wallet. (debit or credit)
- View transaction history and current balance.

---

## Contributing

We welcome contributions! Whether it's fixing bugs, adding new features, or improving documentation, your help is appreciated.

### How to Contribute

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them. There can only be one commit per pull request.
   ```bash
   git commit -m "Add feature: your feature name"
   ```
4. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request from your fork to the `main` branch of the original repository. Use the format/example for [Pull Request](https://github.com/pelumiadebayo/T4dWallet/wiki/Issue-and-Bug-Reporting-Guidelines#example-issuebug-template) in wiki.


## Contribution Guidelines

1. **Code Standards:** Please ensure that your code follows the project's coding standards. We use **ESLint** for linting and **Prettier** for formatting. Write meaningful commit messages using inline comments or documentation blocks
2. **Testing:** All new features and bug fixes must include tests. We use **Jest** for unit tests.
3. **Documentation:** Any changes or new features should be accompanied by appropriate documentation updates. The documentation guideline is as follows;

- docs/features.md - Explains newly added features.
- docs/api.md - Detailed API documentation.
- docs/configuration.md - Advanced configuration options
- CHANGELOG.md - This is where you list changes, bug fixes, new features, and updates. This file would include entries for new features with links to more detailed documentation in the docs/folder. Find example entry below:
    ```markdown
        ### [v1.2.0] - 2024-09-12: Added
        - New Feature: Added Ability to manage multiple currencies in wallets. [See docs/features.md](./docs/features.md) [Your Name]
        OR
        - Changes: Added new field to support dollsr currency in 'multiple currencies' feature. [See docs/features.md](./docs/features.md) [Your Name]
        OR
        - Bug Fixes: Fix the dollar sign bug for the 'multiple currencies' feature. [See docs/features.md](./docs/api.md) [Your Name]


## Issues and Feature Requests

If you encounter any issues, or bugs, feel free to open an issue. Please be as detailed as possible in your description. Log all issues and bugs in the project's Github issue Tracker.
### How to Raise Issues/Bugs
   
1. **Search for Existing Issues**: Before creating a new issue, check the [Issue Tracker](https://github.com/T4dWallet/issues) to see if the same problem has already been reported or discussed.

2. **Submit a New Issue**: If the issue hasn’t been reported, click "New Issue" and provide:
   - A **clear and concise title**.
   - A **description** of the problem, including steps to reproduce it.
   - Any **logs or screenshots** that can help us diagnose the issue.
   - If possible, suggest a solution.

3. **Label the Issue**: Add appropriate labels, such as `bug`, `enhancement`, or `documentation`.
4. 
You can use this [template](https://github.com/pelumiadebayo/T4dWallet/wiki/Issue-and-Bug-Reporting-Guidelines#example-issuebug-template) in wiki for raising bugs or issues.


### Suggesting Features

If you have ideas for new features,  feel free to open an issue to suggest it.
### How to suggest feature

1. **Check for Existing Requests**: Search the [Issue Tracker](https://github.com/T4dWallet/issues) to see if the feature request already exists.
2. **Provide Clear Motivation**: Explain why you think the feature is valuable and how it will improve the project.
3. **Describe the Feature**: Provide a detailed description of the feature, including any technical details.
4. **Alternatives**: If there are existing solutions or workarounds, mention those and explain why your proposed feature is better.
5. **Consider Implementation**: If possible, share how the feature could be implemented or offer to work on it.

You can use this [template](https://github.com/pelumiadebayo/T4dWallet/wiki/suggesting-features#example-feature-request-template) in wiki for feature requests.

## Using GitHub Projects for Project Management

GitHub Projects is used in this project for managing tasks, Collaborate effectively, stay organized, and keep track of project progress in a transparent manner and tracking the progress of the project in an organized way.
You can find the project board here: [T4dWallet project](https://github.com/pelumiadebayo/T4dWallet/projects)

### Why We Use GitHub Projects?

1. **To Visualize Workflows**: GitHub Projects allows you to create **Kanban-style boards** that help visualize workflows, from "To Do" to "In Progress" to "Done."
   
2. **To Track Progress**: It helps track the status of issues, pull requests, and tasks. This is especially useful for coordinating between multiple contributors.

3. **To Prioritize Work**: Organize issues and tasks by priority so everyone knows what to focus on next.

### How to Use GitHub Projects for effective project management.

1. **Access the Project Board**: Navigate to the **Projects** tab within the GitHub repository to view the project board. The board consists of columns, typically labeled "To Do," "In Progress," and "Done."
   
2. **Add Issues/Tasks to the Board**:
- Issues and pull requests from the repository can be added to the project board.
- You can also create tasks within the project board directly.

3. **Track Task Status**: Each task moves through columns as it progresses. Contributors can drag and drop cards between columns to update their status;
- **To Do**: Tasks or issues that need attention.
- **In Progress**: Tasks actively being worked on.
- **Done**: Completed tasks/issues.

4. **Use Milestones**: Organize your tasks by setting **milestones**, which are goals or deadlines you want to achieve. Milestones allow you to group issues and pull requests into specific releases or phases of the project.

5. **Assign Contributors**: You can assign contributors to specific issues or tasks on the board. This helps clarify responsibility and ensures the right people are working on the right tasks.

6. **Use Labels**: Use labels to categorize tasks by type (e.g., `bug`, `enhancement`, `documentation`). This helps organize work and makes it easier to filter tasks based on what’s important.

### Example Workflow:

1. **Create a Task**: Someone creates a new issue in the repository (e.g., "Add payment gateway integration").
   
2. **Add the Issue to the Project**: The issue is added to the "To Do" column in the GitHub Project board.

3. **Assign and Prioritize**: A team member is assigned to the issue, and it’s labeled with `high priority`.

4. **Move to In Progress**: When the team member starts working on the issue, they move the card to the "In Progress" column.

5. **Completion**: Once the work is done and the pull request is merged, the card is moved to the "Done" column.

---

## Using Project's Wikis to Understand the Project
Use the project's wiki to get a deeper understanding of the project and to find important information.
Every Information here and more is contained in the project's wiki.
It contain a detailed overview of the project, its goals, and its current state, including project Architecture and Technicals. Documentation. You can find it here: [Project wiki](https://github.com/pelumiadebayo/T4dWallet/wiki)

### How to Navigate the Wiki

1. **Home Page**: Start with the Wiki’s Home page. This is typically where you’ll find the introduction and links to important sections like installation guides.

2. **Table of Contents**: For quick navigation. Use this to explore different parts of the documentation, such as setup, development process, API documentation, or contribution guidelines.

3. **Search Feature**: You can use the search bar in the Wiki to quickly find specific topics or instructions if you’re looking for something specific.

### Key Pages to Look For:

- Getting Started Guide: Instructions to set up the project locally.
- Architecture Overview: A high-level look at the system’s components and how they interact.
- Contribution Guidelines: Information on how to contribute to the project, file issues, and make pull requests.
---

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for more information.

---

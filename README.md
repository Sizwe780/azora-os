# Azora OS

**Azora OS** is a comprehensive, AI-powered operating system for modern logistics and transportation. It provides tools for route optimization, job management, and real-time fleet monitoring to enhance efficiency and reduce operational costs.

## Key Features

*   **AI-Powered Route Optimization**: Leverages machine learning to find the most efficient routes.
*   **Driver PWA**: A progressive web app for drivers to manage jobs and receive updates.
*   **Operator Dashboard**: A central interface for fleet managers to monitor operations.
*   **Scalable Monorepo Architecture**: Built on a modular monorepo to support future growth.

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/en/) (v18 or newer)
*   [pnpm](https://pnpm.io/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Azora-OS/azora-os.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd azora-os
    ```
3.  Install the dependencies:
    ```bash
    pnpm install
    ```
4.  Start the development servers:
    ```bash
    pnpm dev
    ```

## Repository Structure

This repository is a monorepo managed with pnpm workspaces. Here's a brief overview of the key directories:

*   `./apps`: Contains the user-facing applications, including the `driver-pwa`.
*   `./packages`: Shared packages and UI components used across the applications.
*   `./services`: Backend microservices that power the platform.
*   `./api`: The main API gateway that connects the frontend apps to the backend services.
*   `./ai-models`: Machine learning models, including the route optimization engine.
*   `./infra`: Infrastructure as Code (IaC) for managing deployments.
*   `./docs`: Project documentation, including architectural diagrams and guides.

## Contributing

Contributions are welcome! Please read our `CONTRIBUTING.md` file (once created) to learn how you can help improve Azora OS.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
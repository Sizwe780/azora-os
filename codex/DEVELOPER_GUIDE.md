# Azora OS Developer Guide

## Introduction

Welcome to the Azora OS Developer Guide! Azora OS is an open-source operating system designed for [briefly describe purpose, e.g., lightweight, secure, and user-friendly computing]. This guide provides essential information for developers interested in contributing to, building, or extending Azora OS.

Azora OS follows a constitution that emphasizes:
- **Openness**: All code is open-source under [license, e.g., MIT License].
- **Security**: Prioritizing secure coding practices and regular audits.
- **Community**: Inclusive collaboration and respectful communication.
- **Innovation**: Encouraging experimentation while maintaining stability.
- **Best Practices**: Adhering to industry standards for code quality, documentation, and testing.

This guide assumes familiarity with Linux development, Git, and basic command-line tools. If you're new, start with the prerequisites section.

## Prerequisites

Before contributing, ensure your development environment is set up:

- **Operating System**: Ubuntu 24.04.2 LTS (or compatible Linux distro).
- **Tools**: Git, Docker, and other CLI tools like `curl`, `wget`, `ssh`, etc., are available in the dev container.
- **Hardware**: At least 4GB RAM and 20GB free disk space for building.
- **Accounts**: A GitHub account for pull requests and issue tracking.

### Setting Up the Dev Environment

Azora OS uses a dev container for consistent development. Clone the repository and open it in your IDE (e.g., VS Code with Dev Containers extension).

```bash
git clone https://github.com/azora-os/azora-os.git
cd azora-os
# Open in VS Code or run in dev container
```

To open documentation in your browser: `"$BROWSER" https://azora-os.github.io/docs`

## Getting Started

### Repository Structure

- `src/`: Core source code.
- `docs/`: Documentation (including this guide).
- `tests/`: Unit and integration tests.
- `scripts/`: Build and utility scripts.
- `configs/`: Configuration files.

### Building Azora OS

1. Install dependencies:
    ```bash
    apt update && apt install -y build-essential cmake gcc g++ clang
    ```

2. Build the kernel:
    ```bash
    cd src/kernel
    make
    ```

3. Run tests:
    ```bash
    cd tests
    ./run_tests.sh
    ```

For full system builds, use Docker:
```bash
docker build -t azora-os .
docker run azora-os
```

## Contributing

We welcome contributions! Follow these best practices:

### Code Style
- Use [language-specific style guide, e.g., Google C++ Style Guide] for consistency.
- Run linters: `clang-format` for C/C++, `eslint` for JavaScript.
- Commit messages: Follow [Conventional Commits](https://conventionalcommits.org/).

### Workflow
1. Fork the repo and create a feature branch: `git checkout -b feature/your-feature`.
2. Make changes, add tests, and ensure CI passes.
3. Submit a pull request with a clear description.
4. Await code review and merge.

### Reporting Issues
Use GitHub Issues for bugs or features. Provide:
- Steps to reproduce.
- Expected vs. actual behavior.
- System info (e.g., `uname -a`).

### Testing
- Write unit tests for new code.
- Run integration tests before submitting PRs.
- Use `gh` CLI for GitHub interactions: `gh pr create`.

## Advanced Topics

### Kernel Development
- [Link to kernel docs].
- Debugging with GDB: `gdb ./kernel.bin`.

### Security Guidelines
- Avoid hardcoded secrets.
- Use `gpg` for signing commits.
- Report vulnerabilities privately via [security@azora-os.org].

### Deployment
- Build images with `scripts/build_image.sh`.
- Deploy to test environments using `kubectl` for containerized setups.

## Resources

- [Official Website](https://azora-os.org)
- [API Documentation](https://azora-os.github.io/api)
- [Community Forum](https://forum.azora-os.org)
- [Mailing List](azora-dev@lists.azora-os.org)

For questions, join our Discord or IRC channel.

---

*This guide is maintained by the Azora OS community. Contributions welcome!*
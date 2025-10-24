# Contributing to Azora OS

Thank you for your interest in contributing to Azora OS! This document provides guidelines and information for contributors.

## 🌟 Ways to Contribute

### Development
- **Code Contributions**: Submit pull requests for bug fixes, features, or improvements
- **Documentation**: Help improve documentation, tutorials, and guides
- **Testing**: Write and maintain tests, report bugs, or help with QA

### Community
- **Issue Reporting**: Report bugs or request features using our issue templates
- **Discussions**: Participate in discussions about architecture, features, or roadmap
- **Education**: Help educate others about Azora OS and its mission

### Research & Analysis
- **Economic Research**: Contribute to economic models and analysis
- **AI Research**: Help advance our constitutional AI capabilities
- **Security Research**: Identify and help fix security vulnerabilities

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- Docker & Docker Compose
- Git
- Basic knowledge of TypeScript, React, and microservices

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sizwe780/azora-os.git
   cd azora-os
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development environment**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm test
   ```

## 📝 Development Guidelines

### Code Style
- Follow the existing TypeScript and React patterns
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features

### Pull Request Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run test && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.js
```

### Writing Tests
- Use Jest for unit and integration tests
- Follow the existing test patterns
- Aim for high test coverage
- Test both happy path and error cases

## 📚 Documentation

### API Documentation
- Update API docs for any endpoint changes
- Use Swagger/OpenAPI format
- Include examples and error responses

### Code Documentation
- Add JSDoc comments for public APIs
- Document complex algorithms and business logic
- Keep README files up to date

## 🔒 Security

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email security issues to: security@azora.world
- Allow reasonable time for fixes before public disclosure

### Security Best Practices
- Never commit secrets or credentials
- Use environment variables for configuration
- Follow the principle of least privilege
- Keep dependencies updated

## 🌍 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn and contribute
- Maintain professional communication

### Getting Help
- Check existing issues and documentation first
- Use GitHub Discussions for questions
- Join our community channels

## 🎯 Areas for Contribution

### High Priority
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Test coverage improvement
- [ ] Documentation enhancement
- [ ] Bug fixes

### Medium Priority
- [ ] New feature development
- [ ] UI/UX improvements
- [ ] API enhancements
- [ ] Integration testing

### Future Opportunities
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Advanced AI features
- [ ] Economic modeling tools

## 📞 Contact

- **General Questions**: discussions@azora.world
- **Technical Support**: support@azora.world
- **Security Issues**: security@azora.world
- **Business Inquiries**: enterprise@azora.world

## 🙏 Recognition

Contributors are recognized in our:
- GitHub repository contributors list
- Release notes and changelogs
- Community acknowledgments
- Potential future contributor programs

Thank you for contributing to Azora OS and helping build a more prosperous future for all! 🌟
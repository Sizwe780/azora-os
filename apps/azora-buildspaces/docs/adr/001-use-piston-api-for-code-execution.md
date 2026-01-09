# Architecture Decision Record: Use Piston API for Secure Code Execution

**Status**: Accepted

**Date**: 2025-12-30

**Deciders**: BuildSpaces Core Team

**Constitutional Alignment**: Security by Design, Truth Mandate

---

## Context

BuildSpaces requires the ability to execute user-submitted code in multiple programming languages (JavaScript, TypeScript, Python, Java, C++, Go, Rust, etc.). This execution must be:

1. **Secure**: Prevent malicious code from affecting the host system
2. **Isolated**: Each execution in its own sandbox
3. **Fast**: Response times under 5 seconds for most code
4. **Reliable**: High availability and consistent behavior
5. **Constitutional**: Aligned with Azora's security principles

Initial implementation used `eval()` and `Function()` constructors in Node.js, which posed severe security risks.

## Decision

We will use the **Piston API** (https://github.com/engineer-man/piston) for all code execution needs.

### Piston API Features:
- **Sandboxed Execution**: Runs code in Docker containers with resource limits
- **Multi-Language Support**: 40+ programming languages
- **Resource Limits**: Configurable timeouts, memory limits
- **Self-Hostable**: Can deploy our own instance for production
- **Public Instance**: Free public API for development/testing
- **REST API**: Simple HTTP interface

### Implementation:
```typescript
// app/api/buildspaces/execute/route.ts
const response = await fetch(`${PISTON_API_URL}/execute`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    language: 'javascript',
    version: '*',
    files: [{ content: code }],
    stdin: input,
    compile_timeout: 10000,
    run_timeout: 3000,
    compile_memory_limit: -1,
    run_memory_limit: -1
  })
})
```

## Alternatives Considered

### 1. WebAssembly (WASM)
**Pros:**
- Client-side execution
- No server resources consumed
- Fast

**Cons:**
- Limited language support
- Complex compilation pipeline
- Browser compatibility issues
- No sandboxing guarantees

**Rejected**: Too limited for our multi-language requirements

### 2. AWS Lambda / Cloud Functions
**Pros:**
- Fully managed
- Scales automatically
- Good isolation

**Cons:**
- Cold start latency (1-3 seconds)
- Cost per execution
- Vendor lock-in
- Requires cloud provider setup

**Rejected**: Latency and cost concerns

### 3. Custom Docker Container Execution
**Pros:**
- Full control
- Customizable
- No external dependencies

**Cons:**
- Complex to implement securely
- Requires orchestration (Kubernetes)
- Resource management overhead
- Maintenance burden

**Rejected**: Implementation complexity vs. benefit

### 4. VM-based Sandboxing (gVisor, Firecracker)
**Pros:**
- Strong isolation
- Production-grade
- Used by major platforms

**Cons:**
- Complex setup
- Infrastructure requirements
- Operational overhead
- Slower than containers

**Rejected**: Overkill for current needs

## Consequences

### Positive:
- ✅ **Eliminates Security Vulnerabilities**: No more eval() or Function()
- ✅ **Multi-Language Support**: 40+ languages out of the box
- ✅ **Fast Development**: Ready to use immediately
- ✅ **Self-Hostable**: Can deploy our own instance for production
- ✅ **Resource Limiting**: Built-in timeout and memory controls
- ✅ **Constitutional Compliance**: Aligns with Security by Design principle

### Negative:
- ⚠️ **External Dependency**: Relies on Piston API availability
- ⚠️ **Network Latency**: API calls add 50-200ms overhead
- ⚠️ **Public Instance Limits**: Rate limiting on free tier

### Mitigation:
- Deploy self-hosted Piston instance for production
- Implement caching for repeated executions
- Add fallback error handling
- Monitor API availability

## Implementation Timeline

1. **Week 1**: Integrate Piston API with public instance
2. **Week 2**: Test all supported languages
3. **Week 3**: Deploy self-hosted instance for production
4. **Week 4**: Add monitoring and alerting

## Success Metrics

- Code execution response time < 5 seconds (P95)
- Zero security incidents related to code execution
- Support for 10+ programming languages
- 99.9% execution success rate

## References

- Piston GitHub: https://github.com/engineer-man/piston
- Piston API Docs: https://github.com/engineer-man/piston/blob/master/api_docs.md
- Security Analysis: SECURITY.md#code-execution
- Constitutional Compliance: CONSTITUTION.md#security-by-design

---

## Follow-Up Actions

- [x] Remove eval() and Function() from codebase
- [x] Implement Piston API integration
- [x] Add tests for code execution
- [ ] Deploy self-hosted Piston instance
- [ ] Add execution metrics to Prometheus
- [ ] Document code execution limits for users

---

**Last Updated**: 2026-01-09

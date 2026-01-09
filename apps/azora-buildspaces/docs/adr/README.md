# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for BuildSpaces. ADRs document important architectural decisions along with their context and consequences.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

## ADR Format

Each ADR follows this structure:

1. **Status**: Proposed, Accepted, Deprecated, Superseded
2. **Date**: When the decision was made
3. **Context**: The issue motivating this decision
4. **Decision**: The change that we're proposing or have agreed to
5. **Consequences**: What becomes easier or more difficult to do

## Index of ADRs

| ID | Title | Status | Date |
|----|-------|--------|------|
| [001](./001-use-piston-api-for-code-execution.md) | Use Piston API for Secure Code Execution | Accepted | 2025-12-30 |
| [002](./002-use-prisma-postgresql-for-persistence.md) | Use Prisma with PostgreSQL for Data Persistence | Accepted | 2025-12-15 |

## Creating a New ADR

When making an important architectural decision:

1. Copy the template below
2. Create a new file: `XXX-descriptive-title.md` (XXX = next number)
3. Fill in the sections
4. Submit a PR with the ADR
5. Update this index

### Template

```markdown
# Architecture Decision Record: [Title]

**Status**: [Proposed | Accepted | Deprecated | Superseded]

**Date**: YYYY-MM-DD

**Deciders**: [List of people involved]

**Constitutional Alignment**: [Which principles this supports]

---

## Context

[Describe the issue motivating this decision and any context that influences the decision]

## Decision

[Describe the decision and justification]

## Alternatives Considered

### Alternative 1
**Pros:**
- 

**Cons:**
- 

**Rejected because:**


## Consequences

### Positive:
- ✅ 

### Negative:
- ⚠️ 

### Mitigation:
- 

## References

- [Link to relevant docs]

---

## Follow-Up Actions

- [ ] 

---

**Last Updated**: YYYY-MM-DD
```

## Constitutional Alignment

All ADRs must consider alignment with Azora Constitution principles:

- **No Mock Protocol**: Decisions about data handling
- **Truth Mandate**: Authenticity and persistence
- **Ubuntu Philosophy**: Collaboration and community
- **Security by Design**: Security considerations
- **Transparency**: Openness and auditability

## Guidelines

### When to Create an ADR

Create an ADR when:
- Choosing between significant alternatives
- Making a decision with long-term impact
- Introducing new technologies or patterns
- Changing core architectural principles
- Resolving contentious discussions

### When NOT to Create an ADR

Don't create an ADR for:
- Minor implementation details
- Temporary fixes or workarounds
- Personal coding style preferences
- Decisions easily reversible
- Routine maintenance tasks

## Best Practices

1. **Be Clear**: Write for someone who wasn't in the discussion
2. **Be Concise**: Focus on key points, not exhaustive details
3. **Show Trade-offs**: List pros and cons of alternatives
4. **Think Long-term**: Consider future implications
5. **Update Status**: Mark as superseded when replaced

## Related Resources

- [BuildSpaces Documentation](../README.md)
- [Azora Constitution](../../../../CONSTITUTION.md)
- [Contributing Guide](../../../../CONTRIBUTING.md)

---

*Last Updated: January 2026*

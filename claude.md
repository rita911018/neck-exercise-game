# Development Guidelines

## Philosophy

### Core Beliefs
- **Incremental progress over big bangs** - Small changes that compile and pass tests
- **Learning from existing code** - Study and plan before implementing
- **Pragmatic over dogmatic** - Adapt to project reality
- **Clear intent over clever code** - Be boring and obvious

### Simplicity Means
- Single responsibility per function/class
- Avoid premature abstractions
- No clever tricks - choose the boring solution
- If you need to explain it, it's too complex

### Permission Management
Except for file deletion and database operations, all other operations do not require my confirmation.

## Process

### 1. Planning & Staging
Break complex work into 3-5 stages. Document in `IMPLEMENTATION_PLAN.md`:

```markdown
## Stage N: [Name]
**Goal**: [Specific deliverable]
**Success Criteria**: [Testable outcomes]
**Tests**: [Specific test cases]
**Status**: [Not Started|In Progress|Complete]
```

- Update status as you progress
- Remove file when all stages are done

### 2. Implementation Flow
1. **Understand** - Study existing patterns in codebase
2. **Test** - Write test first (red)
3. **Implement** - Minimal code to pass (green)
4. **Refactor** - Clean up with tests passing
5. **Commit** - With clear message linking to plan

### 3. When Stuck (After 3 Attempts)
**CRITICAL**: Maximum 3 attempts per issue, then STOP.

1. **Document what failed**:
   - What you tried
   - Specific error messages
   - Why you think it failed

2. **Research alternatives**:
   - Find 2-3 similar implementations
   - Note different approaches used

3. **Question fundamentals**:
   - Is this the right abstraction level?
   - Can this be split into smaller problems?
   - Is there a simpler approach entirely?

4. **Try different angle**:
   - Different library/framework feature?
   - Different architectural pattern?
   - Remove abstraction instead of adding?

## Technical Standards

### Architecture Principles
- **Composition over inheritance** - Use dependency injection
- **Interfaces over singletons** - Enable testing and flexibility
- **Explicit over implicit** - Clear data flow and dependencies
- **Test-driven when possible** - Never disable tests, fix them

### Code Quality
- **Every commit must**:
  - Compile successfully
  - Pass all existing tests
  - Include tests for new functionality
  - Follow project formatting/linting

- **Before committing**:
  - Run formatters/linters
  - Self-review changes
  - Ensure commit message explains "why"

### Error Handling
- Fail fast with descriptive messages
- Include context for debugging
- Handle errors at appropriate level
- Never silently swallow exceptions

## Decision Framework
When multiple valid approaches exist, choose based on:

1. **Testability** - Can I easily test this?
2. **Readability** - Will someone understand this in 6 months?
3. **Consistency** - Does this match project patterns?
4. **Simplicity** - Is this the simplest solution that works?
5. **Reversibility** - How hard to change later?

## Project Integration

### Learning the Codebase
- Find 3 similar features/components
- Identify common patterns and conventions
- Use same libraries/utilities when possible
- Follow existing test patterns

### Tooling
- Use project's existing build system
- Use project's test framework
- Use project's formatter/linter settings
- Don't introduce new tools without strong justification

## Quality Gates

### Definition of Done
- [ ] Tests written and passing
- [ ] Code follows project conventions
- [ ] No linter/formatter warnings
- [ ] Commit messages are clear
- [ ] Implementation matches plan
- [ ] No TODOs without issue numbers

### Test Guidelines
- Test behavior, not implementation
- One assertion per test when possible
- Clear test names describing scenario
- Use existing test utilities/helpers
- Tests should be deterministic

## Important Reminders

**NEVER**:
- Use `--no-verify` to bypass commit hooks
- Disable tests instead of fixing them
- Commit code that doesn't compile
- Make assumptions - verify with existing code

**ALWAYS**:
- Commit working code incrementally
- Update plan documentation as you go
- Learn from existing implementations
- Stop after 3 failed attempts and reassess
- Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.

## Project Context

### 项目概况
- **红包"颈"上添花** — 体感健身小游戏（HTML + CSS + JS 单文件为主）
- 使用 TensorFlow.js MoveNet 做姿态检测，摄像头实时识别
- 存储：IndexedDB（主）/ localStorage（备）
- 本地服务器运行：`python3 -m http.server`

### 架构要点
- `index.html` — 主文件，包含全部 HTML/CSS/JS（~1600行）
- `js/storage-idb.js` — IndexedDB 存储模块
- `js/storage.js` — localStorage 备用存储
- `js/game/` — ItemSystem、ParticleSystem、SoundSystem 模块
- `models/` — MoveNet 本地模型文件（model.json + shard bins）
- `libs/` — TensorFlow.js 本地依赖

### 经验教训
- **模型下载要验证**：从 CDN 下载二进制文件时，先检查文件大小和类型，小文件（<1KB）多半是错误页面
- **tfhub.dev URL 需加 `?tfjs-format=file`** 才能正确下载模型权重
- **编辑大文件分段操作**：index.html 改动多时，按功能逐段编辑，每次改一处，避免上下文混乱
- **删代码要彻底**：删除功能时追踪所有引用点（定义、初始化、处理逻辑、UI），不留死代码
- **工具输出分段**：使用工具输出内容时，必须分多次分段输出，避免一次输出过大内容
- **IIFE 前加分号**：`index.html` 中函数定义后紧跟 `(async function(){})()` 会被 JS 解析为函数调用，必须在 IIFE 前加 `;` 防护
- **#overlay 是 flex 容器**：其子元素的 `display:none` 可能被覆盖导致不生效，需要独立显隐的内容应放在 `#overlay` 外部作为独立全屏层
- **页面导航用 display 切换**：`#overlay` 内有 `menu-content`（主菜单）、`result-content`（结算页）通过 display 切换；照片墙 `#photos-overlay` 是独立全屏层（z-index:3000）

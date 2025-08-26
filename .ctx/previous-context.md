# LLM Context Report

## 💻 Environment Info

```
- **Node.js Version**: `v22.17.0`
- **Package Manager**: `pnpm v10.15.0`
- **Operating System**: `linux (6.16.1-1-default)`
- **CPU Architecture**: `x64`
```

## 🌳 Project Structure

```text
.
├── scripts/
│   └── generateContext.mjs
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── cap/
│   │   │       ├── challenge/
│   │   │       │   └── route.ts
│   │   │       └── redeem/
│   │   │           └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── db/
│   │   └── schema.ts
│   └── lib/
│       ├── cap.ts
│       └── db.ts
├── biome.json
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json

```

## 📄 File Contents

<details>
<summary><code>biome.json</code></summary>

```json
{
  "$schema": "https://biomejs.dev/schemas/2.2.0/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": true,
    "includes": ["**", "!node_modules", "!.next", "!dist", "!build"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    },
    "domains": {
      "next": "recommended",
      "react": "recommended"
    }
  },
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}

```

</details>

<details>
<summary><code>drizzle.config.ts</code></summary>

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "src/db/schema.ts",
  out: "drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

```

</details>

<details>
<summary><code>next.config.ts</code></summary>

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

```

</details>

<details>
<summary><code>package.json</code></summary>

```json
{
  "name": "cap-drizzle-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "biome check",
    "format": "biome format --write",
    "ctx": "node ./scripts/generateContext.mjs"
  },
  "dependencies": {
    "@cap.js/server": "^3.0.0",
    "dotenv": "^17.2.1",
    "drizzle-kit": "^0.31.4",
    "drizzle-orm": "^0.44.5",
    "next": "15.5.0",
    "pg": "^8.16.3",
    "react": "19.1.1",
    "react-dom": "19.1.1"
  },
  "devDependencies": {
    "@biomejs/biome": "2.2.2",
    "@types/node": "^24.3.0",
    "@types/pg": "^8.15.5",
    "@types/react": "^19.1.11",
    "@types/react-dom": "^19.1.8",
    "chalk": "^5.6.0",
    "diff": "^8.0.2",
    "ignore": "^7.0.5",
    "tsx": "^4.20.5",
    "typescript": "^5.9.2"
  }
}

```

</details>

<details>
<summary><code>pnpm-workspace.yaml</code></summary>

```yaml
onlyBuiltDependencies:
  - esbuild
  - sharp

```

</details>

<details>
<summary><code>scripts/generateContext.mjs</code></summary>

```javascript
#!/usr/bin/env node
/** biome-ignore-all lint/suspicious/noConsole: This is a CLI script, and logging to the console is its primary function. */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { diffLines } from 'diff';
import ignore from 'ignore';

// --- CONFIGURATION ---
const CTX_DIR = './.ctx';
const ALLOWED_EXT = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.jsx',
  '.json',
  '.md',
  '.sh',
  '.yaml',
  '.yml',
  '.toml',
  '.py',
  '.rb',
]);
const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  '.ctx',
  '.github',
  '.husky',
  '.vscode',
  '.next',
  'dist',
  'build',
  'docs',
]);
const SKIP_FILES = new Set([
  'pnpm-lock.yaml',
  'components.json',
  'README.md',
  '.env',
  '.env.example',
]);

// --- CONSTANTS ---
const PNPM_VERSION_REGEX = /pnpm\/([^\s]+)/;
const TODO_REGEX = /\/\/\s*(TODO|FIXME|HACK):?\s*(.*)/g;
const TRAILING_NEWLINE_REGEX = /\n$/;
const MARKDOWN_FILE_REGEX =
  /<details>\s*<summary><code>(.*?)<\/code><\/summary>[\s\S]*?```[a-z]*\n([\s\S]*?)\n```\s*<\/details>/gs;

// --- LANGUAGE MAPPING FOR MARKDOWN CODE BLOCKS ---
const langMap = {
  '.js': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.jsx': 'jsx',
  '.json': 'json',
  '.md': 'markdown',
  '.sh': 'shell',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'toml',
  '.py': 'python',
  '.rb': 'ruby',
  '': '', // Default for files with no extension
};

// --- BEAUTIFIED LOGGER ---
const logger = {
  info: (msg) => console.log(chalk.cyan(`⚙️ ${msg}`)),
  success: (msg) => console.log(chalk.green(`✅ ${msg}`)),
  warn: (msg) => console.log(chalk.yellow(`⚠️ ${msg}`)),
  error: (msg) => console.log(chalk.red(`❌ ${msg}`)),
  start: (msg) => console.log(chalk.bold.magenta(`\n🚀 ${msg}`)),
  done: (msg) => console.log(chalk.bold.green(`\n🎉 ${msg}\n`)),
  divider: () =>
    console.log(
      chalk.gray('--------------------------------------------------')
    ),
};

// --- HELPER FUNCTIONS ---
const findProjectRoot = () => {
  let currentDir = path.dirname(fileURLToPath(import.meta.url));
  while (true) {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      return currentDir;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      throw new Error(
        'Could not find project root. Make sure there is a package.json in your project root.'
      );
    }
    currentDir = parentDir;
  }
};

const loadJsonSafely = (filePath, defaultValue = {}) => {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch {
    logger.warn(`Could not read or parse ${filePath}. Using default.`);
  }
  return defaultValue;
};

const loadGitignore = (projectRoot) => {
  const gitignorePath = path.join(projectRoot, '.gitignore');
  const ig = ignore();
  if (fs.existsSync(gitignorePath)) {
    ig.add(fs.readFileSync(gitignorePath, 'utf-8'));
  }
  return ig;
};

const walkProjectFiles = (dir, projectRoot, ig) => {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const relativePathForIgnore = path.relative(projectRoot, filePath);

      if (ig.ignores(relativePathForIgnore)) {
        continue;
      }

      try {
        const realPath = fs.realpathSync(filePath);
        const stat = fs.statSync(realPath);
        const relativePath = path.relative(projectRoot, realPath);
        const baseName = path.basename(realPath);

        if (stat.isDirectory()) {
          if (SKIP_DIRS.has(baseName)) {
            continue;
          }
          results = results.concat(walkProjectFiles(realPath, projectRoot, ig));
        } else {
          if (
            SKIP_FILES.has(baseName) ||
            !ALLOWED_EXT.has(path.extname(realPath))
          ) {
            continue;
          }
          results.push(relativePath);
        }
      } catch {
        // Silently ignore files that can't be stat'd
      }
    }
  } catch {
    logger.error(`Could not read directory: ${dir}`);
  }
  return results;
};

// --- MARKDOWN OUTPUT GENERATION ---

const generateDirectoryTree = (filePaths) => {
  const root = {};
  for (const filePath of filePaths) {
    let current = root;
    for (const part of filePath.split(path.sep)) {
      current[part] = current[part] || {};
      current = current[part];
    }
  }

  const buildTree = (node, prefix = '') => {
    let result = '';
    const entries = Object.keys(node).sort((a, b) => {
      const aIsDir = Object.keys(node[a]).length > 0;
      const bIsDir = Object.keys(node[b]).length > 0;
      if (aIsDir !== bIsDir) {
        return aIsDir ? -1 : 1;
      }
      return a.localeCompare(b);
    });
    entries.forEach((entry, index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      const isDir = Object.keys(node[entry]).length > 0;
      result += `${prefix}${connector}${entry}${isDir ? '/' : ''}\n`;
      if (isDir) {
        result += buildTree(node[entry], newPrefix);
      }
    });
    return result;
  };

  return `.\n${buildTree(root)}`;
};

const getSystemInfo = () => {
  const pnpmVersion =
    process.env.npm_config_user_agent?.match(PNPM_VERSION_REGEX)?.[1] || 'N/A';
  return `
- **Node.js Version**: \`${process.version}\`
- **Package Manager**: \`pnpm v${pnpmVersion}\`
- **Operating System**: \`${os.platform()} (${os.release()})\`
- **CPU Architecture**: \`${os.arch()}\`
`.trim();
};

const parseMarkdownContextFile = (content) => {
  const files = new Map();
  const matches = content.matchAll(MARKDOWN_FILE_REGEX);
  for (const match of matches) {
    const filePath = match[1];
    const fileContent = match[2]?.trim() || '';
    if (filePath) {
      files.set(filePath, fileContent);
    }
  }
  return files;
};

// --- RICH DIFF GENERATION (REFACTORED) ---

function createSingleFileDiff(filePath, oldContent, newContent) {
  const diffContent = `--- a/${filePath}\n+++ b/${filePath}\n`;
  const differences = diffLines(oldContent, newContent);
  let fileDiff = '';
  for (const part of differences) {
    const lines = part.value.replace(TRAILING_NEWLINE_REGEX, '').split('\n');
    for (const line of lines) {
      if (part.added) {
        fileDiff += `+${line}\n`;
      } else if (part.removed) {
        fileDiff += `-${line}\n`;
      } else {
        fileDiff += ` ${line}\n`;
      }
    }
  }
  return `${diffContent}${fileDiff}\n`;
}

const generateMarkdownRichDiff = (oldFiles, newFiles) => {
  let diffContent = '';
  const allFiles = new Set([...oldFiles.keys(), ...newFiles.keys()]);

  for (const filePath of Array.from(allFiles).sort()) {
    const oldContent = oldFiles.get(filePath) || '';
    const newContent = newFiles.get(filePath) || '';

    if (oldContent !== newContent) {
      diffContent += createSingleFileDiff(filePath, oldContent, newContent);
    }
  }

  if (!diffContent) {
    return '--- No changes detected. ---';
  }
  return `\`\`\`diff\n${diffContent}\`\`\``;
};

function buildMarkdownContextString(fileContents) {
  let contextString = '# LLM Context Report\n\n';

  const specialSections = {
    'environment-info': '## 💻 Environment Info',
    'project-structure': '## 🌳 Project Structure',
  };

  const contentCopy = new Map(fileContents);

  for (const [key, title] of Object.entries(specialSections)) {
    if (contentCopy.has(key)) {
      contextString += `${title}\n\n`;
      const content = contentCopy.get(key);
      const lang = key === 'project-structure' ? 'text' : '';
      contextString += `\`\`\`${lang}\n${content}\n\`\`\`\n\n`;
      contentCopy.delete(key);
    }
  }

  contextString += '## 📄 File Contents\n\n';

  for (const [filePath, content] of contentCopy.entries()) {
    const ext = path.extname(filePath);
    const lang = langMap[ext] || '';
    contextString += `<details>\n<summary><code>${filePath}</code></summary>\n\n`;
    contextString += `\`\`\`${lang}\n${content}\n\`\`\`\n\n`;
    contextString += '</details>\n\n';
  }

  return contextString;
}

// --- MAIN EXECUTION ---

function processProjectFiles(projectFiles, projectRoot, cache) {
  const newFileContents = new Map();
  const newCache = {};
  let changedFileCount = 0;
  let todosSummary = '# 📝 Action Items (TODOs & FIXMEs)\n\n';

  for (const filePath of projectFiles) {
    try {
      const fullFilePath = path.join(projectRoot, filePath);
      const stats = fs.statSync(fullFilePath);
      const cachedFile = cache[filePath];

      if (
        !cachedFile ||
        cachedFile.mtime !== stats.mtime.toISOString() ||
        cachedFile.size !== stats.size
      ) {
        changedFileCount++;
      }

      const content = fs
        .readFileSync(fullFilePath, 'utf-8')
        .replace(/\r\n/g, '\n');
      newFileContents.set(filePath, content);

      const matches = content.matchAll(TODO_REGEX);
      let fileTodos = '';
      for (const match of matches) {
        const tag = match[1].toUpperCase();
        const task = match[2].trim();
        fileTodos += `- [ ] **${tag}**: ${task}\n`;
      }
      if (fileTodos) {
        todosSummary += `### \`${filePath}\`\n\n${fileTodos}\n`;
      }

      newCache[filePath] = {
        mtime: stats.mtime.toISOString(),
        size: stats.size,
      };
    } catch {
      logger.warn(`Could not process file ${filePath}. Skipping.`);
    }
  }
  return { newFileContents, newCache, changedFileCount, todosSummary };
}

const main = () => {
  logger.start('Starting LLM context generation...');
  logger.divider();

  const projectRoot = findProjectRoot();
  logger.info(`Project root found at: ${chalk.yellow(projectRoot)}`);

  const ctxDir = path.join(projectRoot, CTX_DIR);
  fs.mkdirSync(ctxDir, { recursive: true });

  const currentContextFile = path.join(ctxDir, 'current-context.md');
  const previousContextFile = path.join(ctxDir, 'previous-context.md');
  if (fs.existsSync(currentContextFile)) {
    logger.info('Rotating context: current -> previous');
    fs.renameSync(currentContextFile, previousContextFile);
  }

  const cacheFile = path.join(ctxDir, 'cache.json');
  const cache = loadJsonSafely(cacheFile);
  const gitignoreFilter = loadGitignore(projectRoot);
  logger.success('Loaded .gitignore rules and cache.');

  const projectFiles = walkProjectFiles(
    projectRoot,
    projectRoot,
    gitignoreFilter
  );
  logger.info(`Found ${chalk.yellow(projectFiles.length)} relevant files.`);
  logger.divider();

  const { newFileContents, newCache, changedFileCount, todosSummary } =
    processProjectFiles(projectFiles, projectRoot, cache);

  newFileContents.set('environment-info', getSystemInfo());
  newFileContents.set('project-structure', generateDirectoryTree(projectFiles));

  logger.info(
    `Processed ${chalk.yellow(projectFiles.length)} files (${chalk.yellow(
      changedFileCount
    )} modified).`
  );

  const currentContextString = buildMarkdownContextString(newFileContents);
  fs.writeFileSync(currentContextFile, currentContextString.trim());
  logger.success(`Saved current context to ${chalk.bold(currentContextFile)}`);

  if (todosSummary.includes('- [ ]')) {
    const todosContextFile = path.join(ctxDir, 'todos-context.md');
    fs.writeFileSync(todosContextFile, todosSummary.trim());
    logger.success(
      `Found action items and saved to ${chalk.bold(todosContextFile)}`
    );
  }

  fs.writeFileSync(cacheFile, JSON.stringify(newCache, null, 2));
  logger.success(`Updated cache at ${chalk.bold(cacheFile)}`);

  const previousContent = fs.existsSync(previousContextFile)
    ? fs.readFileSync(previousContextFile, 'utf-8')
    : '';
  const oldFileContents = parseMarkdownContextFile(previousContent);

  const newFileContentsForDiff = new Map(newFileContents);
  newFileContentsForDiff.delete('environment-info');
  newFileContentsForDiff.delete('project-structure');

  const changes = generateMarkdownRichDiff(
    oldFileContents,
    newFileContentsForDiff
  );

  const changesContextFile = path.join(ctxDir, 'changes-context.md');
  fs.writeFileSync(changesContextFile, changes);
  logger.success(`Saved changes context to ${chalk.bold(changesContextFile)}`);

  logger.done('Context generation complete!');
};

main();

```

</details>

<details>
<summary><code>src/app/api/cap/challenge/route.ts</code></summary>

```typescript
import { NextResponse } from "next/server";
import cap from "@/lib/cap";

export async function POST() {
  try {
    const payload = await cap.createChallenge();
    return NextResponse.json(payload);
  } catch (err) {
    console.error("cap challenge error", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

```

</details>

<details>
<summary><code>src/app/api/cap/redeem/route.ts</code></summary>

```typescript
import { NextResponse } from "next/server";
import cap from "@/lib/cap";

export async function POST(request: Request) {
  try {
    const { token, solutions } = await request.json().catch(() => ({}));
    if (!token || !solutions) {
      return NextResponse.json(
        { success: false, error: "missing token or solutions" },
        { status: 400 },
      );
    }
    const result = await cap.redeemChallenge({ token, solutions });
    return NextResponse.json(result);
  } catch (err) {
    console.error("cap redeem error", err);
    return NextResponse.json(
      { success: false, error: "internal" },
      { status: 500 },
    );
  }
}

```

</details>

<details>
<summary><code>src/app/layout.tsx</code></summary>

```tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

```

</details>

<details>
<summary><code>src/app/page.tsx</code></summary>

```tsx


export default function Home() {
  return <div>...</div>;
}

```

</details>

<details>
<summary><code>src/db/schema.ts</code></summary>

```typescript
import { bigint, jsonb, pgTable, text } from "drizzle-orm/pg-core";

export const capChallenges = pgTable("cap_challenges", {
  token: text("token").primaryKey(),
  challenge: jsonb("challenge").notNull(),
  expires: bigint("expires", { mode: "number" }),
});

export const capTokens = pgTable("cap_tokens", {
  token_key: text("token_key").primaryKey(),
  expires: bigint("expires", { mode: "number" }),
});

```

</details>

<details>
<summary><code>src/lib/cap.ts</code></summary>

```typescript
import Cap from "@cap.js/server";
import { eq, lt } from "drizzle-orm";
import { capChallenges, capTokens, db } from "@/lib/db";

type CapChallengeData = { c: number; s: number; d: number };

const cap = new Cap({
  storage: {
    challenges: {
      store: async (token, data) => {
        const expires =
          typeof data.expires === "number"
            ? data.expires
            : Date.now() + 5 * 60 * 1000;
        await db
          .insert(capChallenges)
          .values({ token, challenge: data, expires })
          .onConflictDoUpdate({
            target: capChallenges.token,
            set: { challenge: data, expires },
          });
      },

      read: async (token) => {
        const [row] = await db
          .select()
          .from(capChallenges)
          .where(eq(capChallenges.token, token));

        if (!row || row.expires == null || row.expires <= Date.now()) {
          return null;
        }

        return {
          challenge: row.challenge as CapChallengeData,
          expires: row.expires,
        };
      },

      delete: async (token) => {
        await db.delete(capChallenges).where(eq(capChallenges.token, token));
      },

      listExpired: async () => {
        const rows = await db
          .select({ token: capChallenges.token })
          .from(capChallenges)
          .where(lt(capChallenges.expires, Date.now()));

        return rows.map((r) => r.token);
      },
    },

    tokens: {
      store: async (key, expires) => {
        await db
          .insert(capTokens)
          .values({ token_key: key, expires })
          .onConflictDoUpdate({
            target: capTokens.token_key,
            set: { expires },
          });
      },

      get: async (key) => {
        const [row] = await db
          .select()
          .from(capTokens)
          .where(eq(capTokens.token_key, key));

        if (!row || row.expires == null || row.expires <= Date.now()) {
          return null;
        }

        return row.expires;
      },

      delete: async (key) => {
        await db.delete(capTokens).where(eq(capTokens.token_key, key));
      },

      listExpired: async () => {
        const rows = await db
          .select({ token_key: capTokens.token_key })
          .from(capTokens)
          .where(lt(capTokens.expires, Date.now()));

        return rows.map((r) => r.token_key);
      },
    },
  },
});

export default cap;

```

</details>

<details>
<summary><code>src/lib/db.ts</code></summary>

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { capChallenges, capTokens } from "@/db/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
export { capChallenges, capTokens };

```

</details>

<details>
<summary><code>tsconfig.json</code></summary>

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

</details>
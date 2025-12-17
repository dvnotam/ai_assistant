// Тестовый скрипт для демонстрации работы GitHub MCP
// Запуск: node test-github-mcp.js

const BACKEND_URL = 'http://localhost:3001';

// Цветной вывод в консоль
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

async function testGitHubMCP() {
  console.log('\n' + colors.blue + '=== Тест GitHub MCP Server ===' + colors.reset + '\n');

  // Тест 1: Список доступных инструментов
  console.log(colors.yellow + '1. Получение списка инструментов...' + colors.reset);
  try {
    const toolsResponse = await fetch(`${BACKEND_URL}/api/github/tools`);
    const toolsData = await toolsResponse.json();

    if (toolsData.success && toolsData.tools) {
      console.log(colors.green + '✓ Инструменты получены:' + colors.reset);
      toolsData.tools.forEach(tool => {
        console.log(`  - ${tool.name}: ${tool.description}`);
      });
    } else {
      throw new Error('Не удалось получить список инструментов');
    }
  } catch (error) {
    console.log(colors.red + '✗ Ошибка:' + colors.reset, error.message);
    return;
  }

  console.log('\n' + colors.yellow + '2. Тестирование на популярных репозиториях...' + colors.reset + '\n');

  // Список репозиториев для тестирования
  const repos = [
    { owner: 'facebook', repo: 'react', name: 'React' },
    { owner: 'microsoft', repo: 'vscode', name: 'VS Code' },
    { owner: 'vercel', repo: 'next.js', name: 'Next.js' },
    { owner: 'nodejs', repo: 'node', name: 'Node.js' },
  ];

  for (const { owner, repo, name } of repos) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/github/open-issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo }),
      });

      const data = await response.json();

      if (data.success && data.result) {
        const count = data.result.structuredContent.open_issues_count;
        const text = data.result.content[0].text;

        console.log(colors.green + `✓ ${name} (${owner}/${repo}):` + colors.reset);
        console.log(`  ${text}`);
        console.log(`  Структурированные данные: { open_issues_count: ${count} }\n`);
      } else {
        throw new Error(data.error || 'Неизвестная ошибка');
      }
    } catch (error) {
      console.log(colors.red + `✗ ${name}: ${error.message}` + colors.reset + '\n');
    }

    // Небольшая задержка между запросами
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(colors.blue + '=== Тест завершен ===' + colors.reset + '\n');
}

// Запуск теста
testGitHubMCP().catch(console.error);

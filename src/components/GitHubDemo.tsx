import { useState } from 'react';
import { githubService } from '../services/githubService';
import './GitHubDemo.css';

interface Example {
  owner: string;
  repo: string;
  name: string;
}

const EXAMPLES: Example[] = [
  { owner: 'facebook', repo: 'react', name: 'React' },
  { owner: 'microsoft', repo: 'vscode', name: 'VS Code' },
  { owner: 'vercel', repo: 'next.js', name: 'Next.js' },
  { owner: 'nodejs', repo: 'node', name: 'Node.js' },
  { owner: 'vuejs', repo: 'core', name: 'Vue.js' },
];

interface GitHubDemoProps {
  onBack?: () => void;
}

export function GitHubDemo({ onBack }: GitHubDemoProps) {
  const [owner, setOwner] = useState('facebook');
  const [repo, setRepo] = useState('react');
  const [issuesCount, setIssuesCount] = useState<number | null>(null);
  const [responseText, setResponseText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetIssues = async () => {
    if (!owner || !repo) return;

    setLoading(true);
    setError(null);
    try {
      const info = await githubService.getOpenIssuesInfo(owner, repo);
      if (info.result) {
        setIssuesCount(info.result.structuredContent.open_issues_count);
        setResponseText(info.result.content[0].text);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      setIssuesCount(null);
      setResponseText('');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: Example) => {
    setOwner(example.owner);
    setRepo(example.repo);
    setIssuesCount(null);
    setResponseText('');
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGetIssues();
    }
  };

  return (
    <div className="github-demo-container">
      <div className="github-demo-header">
        <h2>🐙 GitHub MCP Demo</h2>
        {onBack && (
          <button onClick={onBack} className="github-back-button">
            ← Назад к чату
          </button>
        )}
      </div>

      <div className="github-demo-form">
        <div className="github-form-row">
          <div className="github-form-group">
            <label>Owner</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="facebook"
            />
          </div>

          <div className="github-form-group">
            <label>Repo</label>
            <input
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="react"
            />
          </div>
        </div>

        <button
          onClick={handleGetIssues}
          disabled={loading || !owner || !repo}
          className="github-submit-button"
        >
          {loading ? 'Загрузка...' : '🔍 Получить количество issues'}
        </button>
      </div>

      {loading && (
        <div className="github-loading">
          <div className="github-loading-spinner"></div>
          <span>Получаем данные из GitHub API...</span>
        </div>
      )}

      {error && (
        <div className="github-error">
          <strong>Ошибка:</strong> {error}
        </div>
      )}

      {issuesCount !== null && !loading && (
        <div className="github-result">
          <div className="github-result-header">
            <strong>✓ Результат получен</strong>
          </div>
          <p className="github-result-text">{responseText}</p>
          <div className="github-result-data">
            <strong>Структурированные данные:</strong>
            <br />
            <code>{`{ "open_issues_count": ${issuesCount} }`}</code>
          </div>
        </div>
      )}

      <div className="github-examples">
        <h3>Примеры популярных репозиториев:</h3>
        <div className="github-example-buttons">
          {EXAMPLES.map((example) => (
            <button
              key={`${example.owner}/${example.repo}`}
              onClick={() => handleExampleClick(example)}
              className="github-example-button"
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

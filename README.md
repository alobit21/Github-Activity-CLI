# GitHub Activity CLI
# https://roadmap.sh/projects/github-user-activity.
A production-ready command-line interface tool that fetches and displays a user's recent activity from GitHub using its public API.

## 🚀 Features

- **Real-time Activity**: Fetches the latest events from GitHub's public API
- **Accurate Commit Tracking**: Shows real commit counts for push events
- **Deduplication**: Prevents duplicate outputs from similar events
- **Flexible Filtering**: Filter by event type and limit output
- **Beautiful Output**: Colored, human-readable formatting with symbols
- **Error Handling**: Graceful handling of API errors, rate limits, and network issues
- **Authentication Support**: Uses GitHub tokens for higher rate limits

## 📦 Installation

### Local Installation

```bash
# Clone the repository
git clone <repository-url>
cd Github-Activity-CLI

# Install dependencies
npm install

# Make the CLI available globally
npm link
```

### Direct Usage with npx

```bash
npx github-activity <username>
```

## 🔧 Setup

### GitHub Token (Optional but Recommended)

To avoid rate limits and access private repositories, set up a GitHub personal access token:

1. Create a token at [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Set the environment variable:

```bash
export GITHUB_TOKEN=your_token_here
```

Or add it to your shell profile (`.bashrc`, `.zshrc`, etc.):

```bash
echo 'export GITHUB_TOKEN=your_token_here' >> ~/.bashrc
source ~/.bashrc
```

## 📖 Usage

### Basic Usage

```bash
github-activity <username>
```

### Advanced Options

```bash
# Limit the number of events shown
github-activity <username> --limit 10

# Filter by specific event type
github-activity <username> --type PushEvent

# Show only starred repositories
github-activity <username> --type WatchEvent

# Combine options
github-activity <username> --limit 5 --type IssuesEvent
```

### Supported Event Types

- `PushEvent` - Code commits
- `IssuesEvent` - Issue creation/closure
- `IssueCommentEvent` - Issue comments
- `PullRequestEvent` - Pull requests
- `WatchEvent` - Repository stars
- `ForkEvent` - Repository forks
- `CreateEvent` - Repository/branch creation
- `DeleteEvent` - Branch/tag deletion
- `PublicEvent` - Repository made public
- `ReleaseEvent` - New releases

## 📊 Output Format

The CLI displays activity in a clean, human-readable format:

```
GitHub Activity for @username

📝 Pushed 3 commits to user/repo
  2 hours ago

★ Starred user/another-repo
  5 hours ago

🔧 Opened an issue in user/repo
  1 day ago

🔀 Opened a pull request in user/project
  2 days ago

Showing 4 recent events
```

## 🛠️ Development

### Project Structure

```
Github-Activity-CLI/
├── github-activity.js     # Main CLI application
├── github-commits.js      # Legacy commit tracker
├── package.json           # Dependencies and configuration
└── README.md             # This file
```

### Dependencies

- `axios` - HTTP client for GitHub API requests
- `commander` - Command-line argument parsing

### Running in Development

```bash
# Make the script executable
chmod +x github-activity.js

# Run directly
./github-activity.js <username>

# Or using Node
node github-activity.js <username>
```

## 🚨 Error Handling

The CLI gracefully handles various error scenarios:

- **Invalid Username**: Shows "User 'username' not found"
- **Rate Limits**: Suggests waiting or using a GitHub token
- **Network Errors**: Displays connection issues
- **Authentication**: Provides token setup guidance

## 📈 API Details

The tool uses GitHub's public API endpoints:

- `/users/{username}/events` - Main activity feed
- `/repos/{owner}/{repo}/commits?author={username}` - Accurate commit counts

## 🎯 Examples

```bash
# Basic usage
github-activity octocat

# Show last 5 push events
github-activity torvalds --limit 5 --type PushEvent

# Check recent stars
github-activity your-username --type WatchEvent

# Limited output for quick overview
github-activity username --limit 10
```

## 🔮 Future Enhancements

Potential improvements for future versions:

- [ ] Response caching to reduce API requests
- [ ] Activity grouping by repository
- [ ] Time-based filters (last 7 days, 30 days, etc.)
- [ ] Latest commit message display
- [ ] Interactive mode or dashboard view
- [ ] Configuration file support

## 📄 License

ISC License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Built with ❤️ for the developer community**

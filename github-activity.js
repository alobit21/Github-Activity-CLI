#!/usr/bin/env node

const axios = require('axios');
const { program } = require('commander');
const readline = require('readline');

const GITHUB_API = 'https://api.github.com';

program
  .name('github-activity')
  .description('Fetch and display a user\'s recent commits from GitHub')
  .version('1.0.0')
  .argument('<username>', 'GitHub username to fetch commits for')
  .option('-d, --days <number>', 'number of days to look back')
  .parse();

const options = program.opts();
const username = program.args[0];

if (!username) {
  console.error('\x1b[31mError: GitHub username is required\x1b[0m');
  process.exit(1);
}

async function getDaysFromUser() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('\x1b[36mHow many days back do you want to track? (default: 7)\x1b[0m ', (answer) => {
      rl.close();
      const days = parseInt(answer) || 7;
      resolve(days);
    });
  });
}

async function getDaysAgo() {
  if (options.days) {
    return parseInt(options.days);
  } else {
    return await getDaysFromUser();
  }
}

const token = process.env.GITHUB_TOKEN;
const headers = token ? { Authorization: `token ${token}` } : {};

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const symbols = {
  bullet: '●',
  star: '★',
  commit: '📝',
  repo: '📁',
  clock: '🕐'
};

async function getRepos(user) {
  try {
    const res = await axios.get(`${GITHUB_API}/users/${user}/repos`, { headers });
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(`User '${user}' not found`);
    } else if (err.response?.status === 403) {
      if (err.response?.data?.message?.includes('rate limit')) {
        throw new Error('API rate limit exceeded. Try again later or set GITHUB_TOKEN environment variable.');
      }
      throw new Error('Access forbidden. Check your GITHUB_TOKEN if set.');
    } else if (err.code === 'ENOTFOUND') {
      throw new Error('Network error: Unable to connect to GitHub API');
    } else {
      throw new Error(`GitHub API error: ${err.response?.data?.message || err.message}`);
    }
  }
}

async function getCommits(repo, sinceDate) {
  try {
    const res = await axios.get(
      `${GITHUB_API}/repos/${repo.full_name}/commits`,
      { headers, params: { since: sinceDate.toISOString() } }
    );
    return res.data;
  } catch (err) {
    if (err.response?.status === 409) return []; // empty repo
    return [];
  }
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    return 'just now';
  }
}

function truncateMessage(message, maxLength = 60) {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength - 3) + '...';
}

(async () => {
  try {
    const DAYS_AGO = await getDaysAgo();
    
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - DAYS_AGO);
    
    console.log(`${colors.bright}${colors.blue}🚀 GitHub Commit Activity for @${username}${colors.reset}`);
    console.log(`${colors.dim}Showing commits from the last ${DAYS_AGO} day${DAYS_AGO !== 1 ? 's' : ''}${colors.reset}\n`);
    
    const repos = await getRepos(username);
    let totalCommits = 0;
    let activeRepos = 0;
    
    if (repos.length === 0) {
      console.log(`${colors.yellow}ℹ️  No repositories found for this user${colors.reset}`);
      return;
    }

    for (const repo of repos) {
      const commits = await getCommits(repo, sinceDate);
      if (commits.length > 0) {
        activeRepos++;
        totalCommits += commits.length;
        
        console.log(`${symbols.repo} ${colors.bright}${colors.cyan}${repo.name}${colors.reset}`);
        console.log(`  ${symbols.commit} ${colors.green}${commits.length} commit${commits.length !== 1 ? 's' : ''}${colors.reset}`);
        
        const latestCommit = commits[0];
        const commitDate = latestCommit.commit.author.date;
        const commitMessage = truncateMessage(latestCommit.commit.message);
        const timeAgo = formatTimeAgo(commitDate);
        
        console.log(`  ${symbols.clock} ${colors.dim}${timeAgo}${colors.reset}`);
        console.log(`  ${symbols.bullet} ${colors.white}"${commitMessage}"${colors.reset}`);
        console.log();
      }
    }
    
    if (activeRepos === 0) {
      console.log(`${colors.yellow}ℹ️  No commits found in the last ${DAYS_AGO} day${DAYS_AGO !== 1 ? 's' : ''}${colors.reset}`);
    } else {
      console.log(`${colors.dim}─${'─'.repeat(40)}${colors.reset}`);
      console.log(`${colors.bright}📊 Summary:${colors.reset}`);
      console.log(`  ${colors.green}Total Commits:${colors.reset} ${totalCommits}`);
      console.log(`  ${colors.cyan}Active Repos:${colors.reset} ${activeRepos}`);
      console.log(`  ${colors.blue}Total Repos:${colors.reset} ${repos.length}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
})();

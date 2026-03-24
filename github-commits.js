#!/usr/bin/env node

const axios = require('axios');

const username = process.argv[2];
const token = process.env.GITHUB_TOKEN; // store your token in env variable

if (!username) {
  console.error('Please provide a GitHub username.');
  process.exit(1);
}

if (!token) {
  console.error('Set your GitHub token as GITHUB_TOKEN environment variable.');
  process.exit(1);
}

const GITHUB_API = 'https://api.github.com';
const DAYS_AGO = 7;
const sinceDate = new Date();
sinceDate.setDate(sinceDate.getDate() - DAYS_AGO);

const headers = { Authorization: `token ${token}` };

async function getRepos(user) {
  try {
    const res = await axios.get(`${GITHUB_API}/users/${user}/repos`, { headers });
    return res.data;
  } catch (err) {
    console.error('Error fetching repos:', err.response?.status, err.message);
    return [];
  }
}

async function getCommits(repo) {
  try {
    const res = await axios.get(
      `${GITHUB_API}/repos/${repo.full_name}/commits`,
      { headers, params: { since: sinceDate.toISOString() } }
    );
    return res.data;
  } catch (err) {
    if (err.response?.status === 409) return []; // empty repo
    console.error(`Error fetching commits for ${repo.name}:`, err.response?.status, err.message);
    return [];
  }
}

(async () => {
  console.log(`Tracking recent commits for ${username} (last ${DAYS_AGO} days):\n`);
  const repos = await getRepos(username);

  for (const repo of repos) {
    const commits = await getCommits(repo);
    if (commits.length > 0) {
      console.log(`- ${repo.name} → ${commits.length} commit(s)`);
      console.log(`  Latest: ${commits[0].commit.author.date} → ${commits[0].commit.message}\n`);
    }
  }
})();

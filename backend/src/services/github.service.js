const https = require('https');

/**
 * Fetch raw README content from a GitHub repository link.
 * @param {string} repoLink 
 * @returns {Promise<string|null>} README content or null if unfetchable
 */
async function fetchGithubReadme(repoLink) {
  if (!repoLink || typeof repoLink !== 'string') return null;

  try {
    // Extract owner and repo from URL like https://github.com/owner/repo or https://github.com/owner/repo.git
    const match = repoLink.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');

    const branches = ['main', 'master'];
    for (const branch of branches) {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`;
      const content = await httpGet(rawUrl);
      if (content && !content.includes('404: Not Found')) {
        return content.length > 3000 ? content.substring(0, 3000) + '\n...[truncated]' : content;
      }
    }
    return null;
  } catch (err) {
    console.warn(`[GithubService] Could not fetch README for ${repoLink}:`, err.message);
    return null;
  }
}

function httpGet(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'HackHub-Backend' } }, (res) => {
      if (res.statusCode !== 200) {
        return resolve(null);
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(null));
  });
}

module.exports = {
  fetchGithubReadme,
};

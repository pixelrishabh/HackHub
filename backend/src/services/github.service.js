/**
 * Fetch GitHub README for code context.
 */
async function fetchGithubReadme(repoLink) {
  if (!repoLink || typeof repoLink !== 'string') return null;

  try {
    const cleaned = repoLink.replace(/\/$/, '').replace('https://github.com/', '');
    const parts = cleaned.split('/');
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1];

    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
    const response = await fetch(rawUrl);

    if (response.ok) {
      const text = await response.text();
      return text.substring(0, 4000); // cap context length
    }

    // Try master branch fallback
    const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`;
    const masterRes = await fetch(masterUrl);
    if (masterRes.ok) {
      const text = await masterRes.text();
      return text.substring(0, 4000);
    }
  } catch (e) {
    console.warn('[GitHubService] Failed to fetch README:', e.message);
  }

  return null;
}

module.exports = {
  fetchGithubReadme,
};

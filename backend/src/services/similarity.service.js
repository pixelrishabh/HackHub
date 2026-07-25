const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Calculate cosine similarity between two numeric vectors.
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} similarity score from 0.0 to 1.0
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generate TF-IDF/Word Frequency vector representation for text as a fallback embedding.
 * @param {string} text 
 * @param {string[]} vocabulary 
 * @returns {number[]}
 */
function generateTfidfVector(text, vocabulary) {
  const words = (text || '').toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  const wordCount = {};
  words.forEach(w => { wordCount[w] = (wordCount[w] || 0) + 1; });

  return vocabulary.map(term => wordCount[term] || 0);
}

/**
 * Generate embedding vector using Google Gemini API or TF-IDF fallback.
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
async function generateEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      if (result.embedding && result.embedding.values) {
        return result.embedding.values;
      }
    } catch (err) {
      console.warn('[SimilarityService] Gemini embedding call failed, falling back to TF-IDF vector:', err.message);
    }
  }

  // Pure JS Fallback vector calculation (N-gram / word frequency vector)
  return null; // Will be handled in pairwise similarity
}

/**
 * Compare all submissions and return pairs exceeding similarity threshold.
 * @param {Array<{id: string, description: string, repo_link: string, team_id: string, teamName?: string}>} submissions 
 * @param {number} threshold Default 0.85
 * @returns {Promise<Array<{submissionA: object, submissionB: object, similarityScore: number, flagged: boolean}>>}
 */
async function checkAllSubmissionsSimilarity(submissions, threshold = 0.85) {
  if (!submissions || submissions.length < 2) {
    return [];
  }

  // Try generating API embeddings first
  const embeddings = [];
  let usedApi = true;

  for (const sub of submissions) {
    const emb = await generateEmbedding(sub.description);
    if (!emb) {
      usedApi = false;
      break;
    }
    embeddings.push(emb);
  }

  const flaggedPairs = [];

  if (usedApi) {
    // API Vector embeddings Cosine Similarity
    for (let i = 0; i < submissions.length; i++) {
      for (let j = i + 1; j < submissions.length; j++) {
        const score = cosineSimilarity(embeddings[i], embeddings[j]);
        if (score >= threshold) {
          flaggedPairs.push({
            submissionA: submissions[i],
            submissionB: submissions[j],
            similarityScore: parseFloat(score.toFixed(4)),
            flagged: true,
          });
        }
      }
    }
  } else {
    // Fallback: TF-IDF Vocabulary Vector similarity
    const allWords = new Set();
    submissions.forEach(sub => {
      const words = (sub.description || '').toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);
      words.forEach(w => allWords.add(w));
    });

    const vocab = Array.from(allWords);
    const vectors = submissions.map(sub => generateTfidfVector(sub.description, vocab));

    for (let i = 0; i < submissions.length; i++) {
      for (let j = i + 1; j < submissions.length; j++) {
        const score = cosineSimilarity(vectors[i], vectors[j]);
        if (score >= threshold) {
          flaggedPairs.push({
            submissionA: submissions[i],
            submissionB: submissions[j],
            similarityScore: parseFloat(score.toFixed(4)),
            flagged: true,
          });
        }
      }
    }
  }

  return flaggedPairs.sort((a, b) => b.similarityScore - a.similarityScore);
}

module.exports = {
  cosineSimilarity,
  generateEmbedding,
  checkAllSubmissionsSimilarity,
};

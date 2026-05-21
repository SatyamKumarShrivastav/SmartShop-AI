// ===== RECOMMENDATION ENGINE =====
// Hybrid: Collaborative Filtering (60%) + Content-Based Filtering (40%)

function cosineSimilarity(vecA, vecB) {
  const keys = [...new Set([...Object.keys(vecA), ...Object.keys(vecB)])];
  let dot = 0, magA = 0, magB = 0;
  keys.forEach(k => {
    const a = vecA[k] || 0, b = vecB[k] || 0;
    dot += a * b; magA += a * a; magB += b * b;
  });
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function getUserRatingVector(userId) {
  const user = USERS.find(u => u.id === userId);
  return user ? { ...user.ratings } : {};
}

function collaborativeScore(targetUserId, productId) {
  const targetVec = getUserRatingVector(targetUserId);
  let weightedSum = 0, totalSim = 0;
  USERS.forEach(u => {
    if (u.id === targetUserId) return;
    const sim = cosineSimilarity(targetVec, getUserRatingVector(u.id));
    if (sim > 0 && u.ratings[productId]) {
      weightedSum += sim * u.ratings[productId];
      totalSim += sim;
    }
  });
  return totalSim > 0 ? weightedSum / totalSim : 0;
}

function contentBasedScore(userId, productId) {
  const user = USERS.find(u => u.id === userId);
  const product = PRODUCTS.find(p => p.id === productId);
  if (!user || !product) return 0;

  // Category preference boost
  let score = 0;
  if (user.preferences.includes(product.category)) score += 2;

  // Tag overlap with viewed/purchased products
  const interactedProducts = [...new Set([...user.viewHistory, ...user.purchases])]
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean);

  interactedProducts.forEach(ip => {
    const overlap = ip.tags.filter(t => product.tags.includes(t)).length;
    score += overlap * 0.5;
  });

  // Rating boost
  if (user.ratings[productId]) score += user.ratings[productId] * 0.3;

  return Math.min(score / 5, 1); // normalize 0-1
}

function getHybridRecommendations(userId, limit = 6) {
  const user = USERS.find(u => u.id === userId);
  if (!user) return [];
  const purchased = new Set(user.purchases);

  const scored = PRODUCTS
    .filter(p => !purchased.has(p.id))
    .map(p => {
      const cf = collaborativeScore(userId, p.id);
      const cb = contentBasedScore(userId, p.id);
      const hybrid = cf * 0.6 + cb * 0.4;
      const matchPct = Math.round(70 + hybrid * 30);
      return { ...p, cfScore: cf, cbScore: cb, score: hybrid, matchPct };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

function getRelatedProducts(productId, limit = 4) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return [];
  return PRODUCTS
    .filter(p => p.id !== productId)
    .map(p => {
      const tagOverlap = product.tags.filter(t => p.tags.includes(t)).length;
      const catMatch = p.category === product.category ? 2 : 0;
      return { ...p, score: tagOverlap + catMatch };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function getTrendingProducts(limit = 6) {
  return [...PRODUCTS]
    .map(p => {
      const lastMonth = p.monthlySales[p.monthlySales.length - 1];
      const prevMonth = p.monthlySales[p.monthlySales.length - 2];
      return { ...p, trendScore: lastMonth, trendDelta: lastMonth - prevMonth };
    })
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, limit);
}

function getRecommendationReason(userId, product) {
  const user = USERS.find(u => u.id === userId);
  if (!user) return '';
  if (user.preferences.includes(product.category)) return `Matches your interest in ${product.category}`;
  const viewed = user.viewHistory.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  for (const vp of viewed) {
    const overlap = vp.tags.filter(t => product.tags.includes(t));
    if (overlap.length > 0) return `Similar to products you've viewed (${overlap[0]})`;
  }
  return 'Highly rated by users like you';
}

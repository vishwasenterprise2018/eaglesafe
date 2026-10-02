/* Numbered model codes are exact; family prefixes and descriptive words also match. */
(() => {
  const normalize = value => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const aliases = {
    safes: 'safe', locker: 'safe', lockers: 'safe', doors: 'door',
    big: 'large', compact: 'small', strongroom: 'strong room',
    doubledoor: 'double door', tripledoor: 'triple door', vault: 'strong room',
    singledoor: 'single door', locks: 'lock', keys: 'key',
    electronic: 'digital', keypad: 'digital', automatic: 'auto',
  };
  const stopWords = new Set(['a', 'an', 'the', 'for', 'show', 'me', 'find', 'please', 'model', 'models']);

  window.createProductSearch = products => {
    const entries = products.map(product => ({
      product,
      words: new Set(normalize([product.categoryName, product.modelType, 'safe', ...(product.searchTerms || [])].join(' ')).split(' ')),
    }));
    const vocabulary = [...new Set(entries.flatMap(entry => [...entry.words]))];
    const fuzzy = new Fuse(vocabulary, {
      includeScore: true,
      threshold: 0.42,
      ignoreLocation: true,
      ignoreFieldNorm: true,
    });
    const codes = new Map(products.map(product => [normalize(product.model), product]));
    const prefixes = [...new Set([...codes.keys()].map(code => code.replace(/\d+$/, '')))];

    return rawQuery => {
      const query = normalize(rawQuery).slice(0, 120);
      if (!query) return { products, correction: '', invalidModel: false };
      if (codes.has(query)) return { products: [codes.get(query)], correction: '', invalidModel: false };

      // Alphabetic family prefixes may be incomplete, but never approximate a numbered code.
      if (/^[a-z]{2,}$/.test(query) && prefixes.some(prefix => prefix.startsWith(query))) {
        return {
          products: products.filter(product => normalize(product.model).startsWith(query)),
          correction: '',
          invalidModel: false,
        };
      }

      // Never send model-like queries to fuzzy matching, including letter/number typos.
      const looksLikeModel = /\d/.test(query) || prefixes.some(prefix => query.includes(prefix)) || /^[a-z]*mt[a-z]*$/.test(query);
      if (looksLikeModel) return { products: [], correction: '', invalidModel: true };
      const tokens = query.replace(/[^a-z\s-]/g, ' ').replace(/-/g, ' ').split(/\s+/)
        .filter((word, index, all) => word && (!stopWords.has(word)
          || (index === all.length - 1 && vocabulary.some(value => value.startsWith(word)))))
        .flatMap(word => (aliases[word] || word).split(' '));
      if (!tokens.length) return { products: [], correction: '', invalidModel: false };

      let corrected = false;
      const words = [];
      for (const [index, token] of tokens.entries()) {
        if (vocabulary.includes(token)) { words.push([token]); continue; }
        // The final descriptive word may still be in progress: "double do", "defender p".
        // Keep all matching completions rather than guessing one or treating it as a typo.
        if (index === tokens.length - 1) {
          const completions = vocabulary.filter(word => word.startsWith(token));
          if (completions.length) { words.push(completions); continue; }
        }
        if (token.length < 4) return { products: [], correction: '', invalidModel: false };
        const hits = fuzzy.search(token);
        // Reject ambiguous corrections instead of silently choosing a different category.
        if (!hits.length || (hits[1] && hits[1].score - hits[0].score < 0.08)) {
          return { products: [], correction: '', invalidModel: false };
        }
        words.push([hits[0].item]);
        corrected = true;
      }
      return {
        products: entries.filter(entry => words.every(options => options.some(word => entry.words.has(word)))).map(entry => entry.product),
        correction: corrected ? words.map((options, index) => options.length === 1 ? options[0] : tokens[index]).join(' ') : '',
        invalidModel: false,
      };
    };
  };
})();

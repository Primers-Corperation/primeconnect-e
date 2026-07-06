// Live USD -> NGN rate, cached briefly so we don't hit the rate API on
// every request. Falls back to the last known-good rate if a refresh
// fails, so a transient outage doesn't take down pricing entirely.
const TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = global._fxCache || (global._fxCache = { rate: null, fetchedAt: 0 });

export async function getUsdToNgnRate() {
  const isFresh = cache.rate && Date.now() - cache.fetchedAt < TTL_MS;
  if (isFresh) return cache.rate;

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    const rate = data?.rates?.NGN;
    if (typeof rate !== 'number' || rate <= 0) throw new Error('NGN rate missing from response');
    cache.rate = rate;
    cache.fetchedAt = Date.now();
    return rate;
  } catch (err) {
    if (cache.rate) {
      console.error('FX rate refresh failed, using stale cached rate:', err.message);
      return cache.rate;
    }
    throw err;
  }
}

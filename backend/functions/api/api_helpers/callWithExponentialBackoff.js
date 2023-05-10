const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 500;

// Call a function with exponential backoff.

exports.callWithExponentialBackoff = async (fn, args, retryCount = 0) => {
  try {
    return await fn(...args);
  } catch (error) {
    if (retryCount >= MAX_RETRIES) {
      console.error(`Failed after ${MAX_RETRIES} retries: ${error}`);
      throw error;
    }
    const delay = INITIAL_DELAY_MS * Math.pow(2, retryCount);
    const jitter = Math.random() * 1000; // add random delay up to 1 second
    console.log(`Call failed, retrying after ${delay} ms...`);
    await new Promise((resolve) => setTimeout(resolve, delay + jitter));
    return exports.callWithExponentialBackoff(fn, args, retryCount + 1);
  }
};

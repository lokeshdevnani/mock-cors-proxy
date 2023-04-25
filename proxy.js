const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const minimist = require('minimist');
const chalk = require('chalk');

const app = express();

const argv = minimist(process.argv.slice(2));

const TARGET_URL = argv.targetUrl
const PORT = parseInt(argv.port, 10) || 6001;
const MODE = (argv.mode && argv.mode.toLowerCase()) || 'mix';


if (!argv.targetUrl) {
  console.log(chalk.red('No target URL specified.'))
  console.log(chalk.red('Usage: node index.js --targetUrl <target_url> --port <port> --mode <mode>'));
  console.log('\n' + chalk.green('Modes:'));
  console.log('  ' + chalk.blue('capture-only') + ': Only caches requests to the file system but does not read from them.');
  console.log('  ' + chalk.blue('proxy-only') + ': Only hits the target URL and does not use caching.');
  console.log('  ' + chalk.blue('mix') + ': Uses both caching and proxying.');
  process.exit(1);
}


if (!['capture-only', 'proxy-only', 'mix'].includes(MODE)) {
  console.log(chalk.red('Invalid mode. Choose one of the following: capture-only, proxy-only, mix.'));
  process.exit(1);
}

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

const CACHE_DIR = './cache';

if (MODE !== 'proxy-only') {
  // Create cache directory if it doesn't exist
  fs.ensureDirSync(CACHE_DIR);
}

// Generate cache key based on the original URL
function generateCacheKey(req) {
  return req.originalUrl.replace(/\//g, '__');
}

// Route for proxying and caching requests
app.all('*', async (req, res) => {
  const { method, headers, body } = req;
  const url = TARGET_URL + req.originalUrl;

  const cacheKey = generateCacheKey(req);
  const cacheFilePath = path.join(CACHE_DIR, cacheKey + '.json');

  // If mode is 'mix' and cache file exists, return cached response
  if (MODE === 'mix' && await fs.pathExists(cacheFilePath)) {
    const cachedResponse = await fs.readJson(cacheFilePath);
    console.log(chalk.green(`[CACHE] ${method} ${req.originalUrl}`))
    return res.status(cachedResponse.status).set(cachedResponse.headers).send(cachedResponse.data);
  }

  // Remove host and connection headers to avoid conflicts
  delete headers.host;
  delete headers.connection;

  try {
    const axiosResponse = await axios({
      method,
      url,
      headers,
      data: body,
    });

    console.log(chalk.blue(`[PROXY] ${method} ${req.originalUrl}`))

    // Cache the response if mode is 'capture-only' or 'mix'
    if (MODE !== 'proxy-only') {
      await fs.writeJson(cacheFilePath, {
        status: axiosResponse.status,
        headers: axiosResponse.headers,
        data: axiosResponse.data,
      });
    }

    // Forward status, headers, and data from Axios response
    res.status(axiosResponse.status).set(axiosResponse.headers).send(axiosResponse.data);
  } catch (error) {
    console.log(chalk.red(`[ERROR] ${method} ${req.originalUrl}`))
    if (error.response) {
      // Forward error status, headers, and data from Axios error response
      res.status(error.response.status).set(error.response.headers).send(error.response.data);
    } else {
      // If the request failed for any other reason, return a 500 status code
      res.status(500).send('An error occurred while proxying the request.');
    }
  }
});

app.listen(PORT, () => {
  console.log(chalk.yellow(`CORS proxy server with mode "${MODE}" listening on port ${PORT}`));
});
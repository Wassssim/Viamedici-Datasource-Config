import express from 'express';
import { getConfig } from '../services/configService';

const router = express.Router();

router.get('/sources/types', (req, res) => {
  const config = getConfig();

  if (!config) {
    // TODO: use logging
    return res.status(500).json({ error: 'Configuration not available' });
  }
  res.json({ sources: Object.keys(config.sourcesConfig) });
});

router.get('/sources/:source', (req, res) => {
  const config = getConfig();
  const mappedConfig = Object.values(
    config.sourcesConfig[req.params.source]
  ).map((srcCfg: any, idx) => {
    let label = req.params.source;
    if ('database' in srcCfg) label += ' - ' + srcCfg.database;
    else if ('host' in srcCfg) label += ' - ' + srcCfg.host;

    return { label: label + ' - ' + (idx + 1), id: idx };
  });

  if (!config) {
    // TODO: use logging
    return res.status(500).json({ error: 'Configuration not available' });
  }
  res.json({ data: mappedConfig });
});

module.exports = router;

import fs from 'fs';
import path from 'path';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { DataSourceConfig } from '../types/data-source-config';

const configFilePath = path.join(__dirname, '../../config.json');

let config: DataSourceConfig | null = null;

// Function to load and validate the config
function loadConfig(): void {
  try {
    const fileContent = fs.readFileSync(configFilePath, 'utf-8');
    const parsedConfig = JSON.parse(fileContent);

    // Transform into class instance
    const configInstance = plainToInstance(DataSourceConfig, parsedConfig);
    const errors = validateSync(configInstance);

    if (errors.length > 0) {
      console.error('Invalid config format:', errors);
      config = null;
    } else {
      config = configInstance;
    }
  } catch (error) {
    console.error('Failed to load config file:', (error as Error).message);
    config = null;
  }
}

// Load config when the service starts
loadConfig();

// Function to get the current config
export function getConfig(): DataSourceConfig | null {
  return config;
}

export const getConfigBasePath = () => path.join(__dirname, '../../');

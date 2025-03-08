import { DataSource } from '../types/data-source-config';
import * as configService from './configService';
import fs from 'fs';
import path from 'path';

const config = configService.getConfig();

function getPropertiesFilePath() {
  const basePath = configService.getConfigBasePath();

  return path.join(basePath, config.sourcesConfig[DataSource.File].filePath);
}

export function parseFile(): Record<string, string> {
  if (!config.sourcesConfig[DataSource.File]) return {};

  const file = fs.readFileSync(getPropertiesFilePath());

  if (!file) return {};

  const content = file.toString();
  const lines = content.split('\n');

  const data: Record<string, string> = {};
  lines.forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value) data[key.trim()] = value.trim();
  });

  return data;
}

export function createPropertiesFile(
  keyValueObject: Record<string, string>,
  filePath: string
) {
  const propertiesContent = Object.entries(keyValueObject)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(filePath, Buffer.from(propertiesContent, 'utf-8'));
}

export function updatePropertiesFile(keyValueObject: Record<string, string>) {
  createPropertiesFile(keyValueObject, getPropertiesFilePath());
}

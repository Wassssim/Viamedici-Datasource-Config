import { DataSource, FileConfig } from '../types/data-source-config';
import * as configService from './configService';
import fs from 'fs';
import path from 'path';

const config = configService.getConfig();

export default class PropertiesFileService {
  static _instance: PropertiesFileService;

  constructor() {
    if (PropertiesFileService._instance) {
      return PropertiesFileService._instance;
    }
    PropertiesFileService._instance = this;
  }

  getCurrentConfig(sourceIndex) {
    const config = configService.getConfig();

    return config.sourcesConfig[DataSource.File][sourceIndex] as FileConfig;
  }

  getPropertiesFilePath(sourceIndex) {
    return config.sourcesConfig[DataSource.File][sourceIndex].filePath;
  }

  parseFile(sourceIndex: number): Record<string, string> {
    if (!config.sourcesConfig[DataSource.File]) return {};

    const file = fs.readFileSync(this.getPropertiesFilePath(sourceIndex));

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

  createPropertiesFile(
    keyValueObject: Record<string, string>,
    filePath: string
  ) {
    const propertiesContent = Object.entries(keyValueObject)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFileSync(filePath, Buffer.from(propertiesContent, 'utf-8'));
  }

  updatePropertiesFile(
    updatedEntries: { originalKey: string; key: string; value: string }[],
    sourceIndex: number
  ) {
    const existingData = this.parseFile(sourceIndex);
    const updatedExistingEntries = {};
    const newEntries = [];

    updatedEntries.forEach((entry) => {
      if (entry.originalKey !== null) {
        updatedExistingEntries[entry.originalKey] = entry;
      } else {
        newEntries.push(entry);
      }
    });

    const updatedData = {};
    Object.keys(existingData).forEach((originalKey) => {
      if (originalKey in updatedExistingEntries) {
        const { key, value } = updatedExistingEntries[originalKey];
        updatedData[key] = value;
      } else {
        updatedData[originalKey] = existingData[originalKey];
      }
    });

    newEntries.forEach((entry) => (updatedData[entry.key] = entry.value));

    this.createPropertiesFile(
      updatedData,
      this.getPropertiesFilePath(sourceIndex)
    );
  }
}

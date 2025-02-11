export class NoConfigurationError extends Error {
  constructor() {
    super('No configuration selected');
    this.name = 'NoConfigurationError';
  }
}

export class InvalidConfigurationError extends Error {
  constructor() {
    super('The configuration is invalid');
    this.name = 'InvalidConfigurationError';
  }
}

export class ConfigurationExistsError extends Error {
  constructor() {
    super('The configuration already exists');
    this.name = 'ConfigurationExistsError';
  }
}
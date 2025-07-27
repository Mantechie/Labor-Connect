class Logger {
  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_DEBUG === 'true';
    this.showConsoleLogs = import.meta.env.VITE_SHOW_CONSOLE_LOGS === 'true';
    this.environment = import.meta.env.VITE_NODE_ENV;
  }

  info(message, data) {
    if (this.isEnabled && this.showConsoleLogs) {
      console.info(`ℹ️ ${message}`, data || '');
    }
  }

  warn(message, data) {
    if (this.isEnabled && this.showConsoleLogs) {
      console.warn(`⚠️ ${message}`, data || '');
    }
  }

  error(message, error) {
    // Always log errors in development, but be selective in production
    if (this.environment === 'development' || this.isEnabled) {
      console.error(`❌ ${message}`, error || '');
    }
  }

  debug(message, data) {
    if (this.isEnabled && this.showConsoleLogs) {
      console.debug(`🔍 ${message}`, data || '');
    }
  }

  // For critical errors that should always be logged
  critical(message, error) {
    console.error(`🚨 CRITICAL: ${message}`, error || '');
    
    // In production, you might want to send this to a monitoring service
    if (this.environment === 'production' && import.meta.env.VITE_SENTRY_DSN) {
      // Example: Sentry.captureException(error);
    }
  }
}

export default new Logger();

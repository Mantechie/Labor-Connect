import logger from './logger';
import networkMonitor from './networkMonitor';
import axiosInstance from './axiosInstance';

class RequestQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    
    // Start processing when online
    networkMonitor.addListener(this.handleNetworkChange.bind(this));
  }
  
  handleNetworkChange(isOnline) {
    if (isOnline && this.queue.length > 0) {
      this.processQueue();
    }
  }
  
  addToQueue(request) {
    logger.info('Adding request to queue', request);
    this.queue.push(request);
    
    // If online, process immediately
    if (networkMonitor.getStatus() && !this.isProcessing) {
      this.processQueue();
    }
    
    return new Promise((resolve, reject) => {
      request.resolve = resolve;
      request.reject = reject;
    });
  }
  
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    logger.info(`Processing ${this.queue.length} queued requests`);
    
    while (this.queue.length > 0) {
      const request = this.queue[0];
      
      try {
        const response = await axiosInstance({
          method: request.method,
          url: request.url,
          data: request.data,
          headers: request.headers
        });
        
        request.resolve(response);
      } catch (error) {
        request.reject(error);
      } finally {
        this.queue.shift(); // Remove processed request
      }
    }
    
    this.isProcessing = false;
  }
}

export default new RequestQueue();

// Browser-compatible Azure Communication Services wrapper for TypeScript
class AzureCommunicationService {
  callClient: any = null;
  callAgent: any = null;
  deviceManager: any = null;
  call: any = null;
  localVideoStream: any = null;
  isInitialized: boolean = false;
  sdkClasses: any = null;
  isLoading: boolean = false;
  isInitializingCall: boolean = false; // Prevent multiple simultaneous initializations

  // Check if we're in a browser environment
  isBrowserEnvironment(): boolean {
    return typeof window !== 'undefined' && 
           typeof navigator !== 'undefined' && 
           typeof MediaStream !== 'undefined';
  }

  // Dynamically import Azure SDK classes
  async loadSDKClasses() {
    if (this.isLoading) {
      // Wait for current loading to complete
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.sdkClasses;
    }

    if (this.sdkClasses) {
      return this.sdkClasses;
    }

    if (!this.isBrowserEnvironment()) {
      throw new Error('Azure Communication Services requires a browser environment');
    }

    this.isLoading = true;

    try {
      // Dynamic imports for browser compatibility
      const callingSDK = await import('@azure/communication-calling');
      const { AzureCommunicationTokenCredential } = await import('@azure/communication-common');
      
      this.sdkClasses = {
        CallClient: callingSDK.CallClient,
        AzureCommunicationTokenCredential,
        LocalVideoStream: callingSDK.LocalVideoStream,
        VideoStreamRenderer: callingSDK.VideoStreamRenderer
      };

      return this.sdkClasses;
    } catch (error: any) {
      throw new Error('Failed to load Azure Communication Services SDK: ' + error.message);
    } finally {
      this.isLoading = false;
    }
  }

  async initialize() {
    try {
      if (!this.isBrowserEnvironment()) {
        throw new Error('Azure Communication Services requires a browser environment');
      }

      // Load SDK classes
      await this.loadSDKClasses();
      
      // Create call client
      this.callClient = new this.sdkClasses.CallClient();

      // Get device manager
      this.deviceManager = await this.callClient.getDeviceManager();

      // Request permissions
      await this.deviceManager.askDevicePermission({ audio: true, video: true });

      this.isInitialized = true;
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  async createCallAgent(token: string) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Wait for any ongoing initialization to complete (handles React Strict Mode double-calls)
      let waitCount = 0;
      while (this.isInitializingCall && waitCount < 50) { // Max 5 seconds wait
        console.warn('⚠️ Call already initializing, waiting...');
        await new Promise(resolve => setTimeout(resolve, 100));
        waitCount++;
      }

      // If agent already exists and is valid, return it (for React Strict Mode second call)
      if (this.callAgent && !this.isInitializingCall) {
        console.log('✅ Reusing existing CallAgent');
        return this.callAgent;
      }

      this.isInitializingCall = true;

      // Dispose of existing call agent if it exists
      if (this.callAgent) {
        try {
          console.log('🧹 Disposing old call agent...');
          this.callAgent.dispose();
          this.callAgent = null;
        } catch (disposeError) {
          console.warn('Error disposing old call agent:', disposeError);
        }
      }

      // Create new call client for each agent (Azure limitation)
      console.log('🔧 Creating new CallClient...');
      this.callClient = new this.sdkClasses.CallClient();
      this.deviceManager = await this.callClient.getDeviceManager();

      // Create token credential
      const tokenCredential = new this.sdkClasses.AzureCommunicationTokenCredential(token);

      // Create call agent
      console.log('🔧 Creating new CallAgent...');
      this.callAgent = await this.callClient.createCallAgent(tokenCredential, {
        displayName: 'Green Loop User'
      });

      console.log('✅ CallAgent created successfully');
      this.isInitializingCall = false;
      return this.callAgent;
    } catch (error) {
      this.isInitializingCall = false;
      this.callAgent = null; // Clear on error
      throw error;
    }
  }

  async getCameraDevice() {
    try {
      const cameras = await this.deviceManager.getCameras();
      if (cameras.length === 0) {
        throw new Error('No camera available');
      }
      return cameras[0];
    } catch (error) {
      throw error;
    }
  }

  async createLocalVideoStream() {
    try {
      const cameraDevice = await this.getCameraDevice();
      this.localVideoStream = new this.sdkClasses.LocalVideoStream(cameraDevice);
      return this.localVideoStream;
    } catch (error) {
      throw error;
    }
  }

  async joinCall(groupId: string, localVideoStream?: any) {
    try {
      if (!this.callAgent) {
        throw new Error('CallAgent not initialized. Please create call agent before joining call.');
      }

      console.log('🔗 Joining call with group ID:', groupId);
      
      const joinOptions: any = {
        videoOptions: {
          localVideoStreams: localVideoStream ? [localVideoStream] : []
        }
      };

      this.call = await this.callAgent.join({
        groupId: groupId,
        ...joinOptions
      });

      console.log('✅ Successfully joined call');
      return this.call;
    } catch (error) {
      console.error('❌ Error joining call:', error);
      throw error;
    }
  }

  async startVideo() {
    try {
      if (this.call && this.localVideoStream) {
        // Only start if not already started
        const isAlreadyStarted = this.call.localVideoStreams &&
          this.call.localVideoStreams.includes(this.localVideoStream);
        if (!isAlreadyStarted) {
          await this.call.startVideo(this.localVideoStream);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async stopVideo() {
    try {
      if (this.call && this.localVideoStream) {
        // Only stop if currently started
        const isStarted = this.call.localVideoStreams &&
          this.call.localVideoStreams.includes(this.localVideoStream);
        if (isStarted) {
          await this.call.stopVideo(this.localVideoStream);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async mute() {
    try {
      if (this.call) {
        await this.call.mute();
      }
    } catch (error) {
      throw error;
    }
  }

  async unmute() {
    try {
      if (this.call) {
        await this.call.unmute();
      }
    } catch (error) {
      throw error;
    }
  }

  async hangUp() {
    try {
      if (this.call) {
        await this.call.hangUp();
      }
    } catch (error) {
      throw error;
    }
  }

  // Complete cleanup - stops camera and disposes all resources
  async cleanup() {
    try {
      console.log('🧹 AzureCommunicationService: Starting cleanup...');
      
      // Reset initialization flag
      this.isInitializingCall = false;
      
      // Stop local video stream and turn off camera
      if (this.localVideoStream) {
        try {
          const mediaStream = this.localVideoStream.mediaStream;
          if (mediaStream) {
            mediaStream.getTracks().forEach((track: any) => {
              track.stop();
              console.log('🎥 Stopped track:', track.kind);
            });
          }
          this.localVideoStream.dispose();
        } catch (e) {
          console.warn('Error disposing local video stream:', e);
        }
        this.localVideoStream = null;
      }

      // Hang up call
      if (this.call) {
        try {
          await this.call.hangUp();
        } catch (e) {
          console.warn('Error hanging up call:', e);
        }
        this.call = null;
      }

      // Dispose call agent
      if (this.callAgent) {
        try {
          this.callAgent.dispose();
        } catch (e) {
          console.warn('Error disposing call agent:', e);
        }
        this.callAgent = null;
      }

      console.log('✅ AzureCommunicationService: Cleanup complete');
    } catch (error) {
      console.error('Error during cleanup:', error);
      this.isInitializingCall = false; // Reset flag even on error
    }
  }

  // Get SDK classes for components that need them
  getSDKClasses() {
    return this.sdkClasses;
  }

  // Check if SDK is available (synchronous check)
  isSDKAvailable(): boolean {
    return this.isBrowserEnvironment() && this.sdkClasses !== null;
  }

  // Check if service is ready
  isReady(): boolean {
    return this.isInitialized && this.isSDKAvailable();
  }

  // Async method to ensure SDK is loaded
  async ensureSDKLoaded(): Promise<boolean> {
    if (!this.isSDKAvailable()) {
      await this.loadSDKClasses();
    }
    return this.isSDKAvailable();
  }
}

// Create singleton instance
const azureCommunicationService = new AzureCommunicationService();

export default azureCommunicationService;


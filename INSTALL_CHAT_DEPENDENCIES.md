# Install Chat and Video Call Dependencies

Run these commands in the `green-loop-fe` directory:

```bash
# WebSocket dependencies for real-time messaging
npm install sockjs-client @stomp/stompjs

# Azure Communication Services for video calls
npm install @azure/communication-calling @azure/communication-chat @azure/communication-common

# Type definitions
npm install --save-dev @types/sockjs-client
```

## Dependencies Needed:

1. **sockjs-client** - WebSocket polyfill for browser compatibility
2. **@stomp/stompjs** - STOMP protocol client for WebSocket messaging
3. **@azure/communication-calling** - Azure Communication Services video calling SDK
4. **@azure/communication-chat** - Azure Communication Services chat SDK (optional, we're using our own backend)
5. **@azure/communication-common** - Common types for Azure Communication Services

## After Installation:

The chat functionality will be ready to use. The frontend components will connect to:
- WebSocket endpoint: `http://localhost:8080/api/ws`
- REST API endpoints: `http://localhost:8080/api/chat/*` and `http://localhost:8080/api/azure-communication/*`



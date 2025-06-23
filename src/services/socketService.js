import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class SocketService {
  constructor() {
    this.stompClient = null;
    this.subscriptions = new Map();
  }

  connect() {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = () => {
      console.log('Connected to WebSocket');
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame);
    };

    this.stompClient.activate();
    return this.stompClient;
  }

  // Subscribe to branch-specific requests
  subscribeToBranchRequests(branchId, callback) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('WebSocket not connected');
      return;
    }

    const subscription = this.stompClient.subscribe(
      `/topic/branch/${branchId}`,
      (message) => {
        const update = JSON.parse(message.body);
        callback(update);
      }
    );

    this.subscriptions.set(`branch-${branchId}`, subscription);
  }

  // Subscribe to client-specific request updates
  subscribeToClientRequests(userId, callback) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('WebSocket not connected');
      return;
    }

    const subscription = this.stompClient.subscribe(
      `/topic/client/${userId}/requests`,
      (message) => {
        const update = JSON.parse(message.body);
        callback(update);
      }
    );

    this.subscriptions.set(`client-${userId}`, subscription);
  }

  // Subscribe to order status updates
  subscribeToOrder(orderId, callback) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('WebSocket not connected');
      return;
    }

    const subscription = this.stompClient.subscribe(
      `/topic/orders/${orderId}`,
      (message) => {
        const update = JSON.parse(message.body);
        callback(update);
      }
    );

    this.subscriptions.set(`order-${orderId}`, subscription);
  }

  // Unsubscribe from branch requests
  unsubscribeFromBranchRequests(branchId) {
    const subscription = this.subscriptions.get(`branch-${branchId}`);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(`branch-${branchId}`);
    }
  }

  // Unsubscribe from client requests
  unsubscribeFromClientRequests(userId) {
    const subscription = this.subscriptions.get(`client-${userId}`);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(`client-${userId}`);
    }
  }

  // Unsubscribe from order updates
  unsubscribeFromOrder(orderId) {
    const subscription = this.subscriptions.get(`order-${orderId}`);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(`order-${orderId}`);
    }
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}

export const socketService = new SocketService(); 
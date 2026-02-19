/**
 * OpenClaw Gateway WebSocket Client
 * US-082: Real-time streaming chat via WebSocket
 *
 * Protocol:
 *   SEND: { type: "message", content: string, token: string }
 *   RECV: { type: "chunk", content: string } | { type: "done" } | { type: "error", message: string }
 */

export type ChunkCallback = (text: string) => void;
export type DoneCallback = () => void;
export type ErrorCallback = (err: Error) => void;
export type ConnectedCallback = () => void;
export type DisconnectedCallback = () => void;

const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30000;

class GatewayClient {
  private ws: WebSocket | null = null;
  private _url: string = '';
  private _token: string = '';
  private retryCount: number = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private _shouldReconnect: boolean = false;
  private _connected: boolean = false;

  // Callbacks — replace before each send
  public onChunk: ChunkCallback = () => {};
  public onDone: DoneCallback = () => {};
  public onError: ErrorCallback = () => {};
  public onConnected: ConnectedCallback = () => {};
  public onDisconnected: DisconnectedCallback = () => {};

  /** Connect (or reconnect) to the gateway. Resets retry counter. */
  connect(url: string, token: string = ''): void {
    this._url = url;
    this._token = token;
    this._shouldReconnect = true;
    this.retryCount = 0;
    this._doConnect();
  }

  private _doConnect(): void {
    // Close existing socket cleanly
    if (this.ws) {
      try { this.ws.close(); } catch { /* ignore */ }
      this.ws = null;
    }

    // Convert http(s) → ws(s) and append /ws
    let wsUrl = this._url
      .replace(/^https:\/\//i, 'wss://')
      .replace(/^http:\/\//i, 'ws://')
      .replace(/\/+$/, '');

    if (!wsUrl.endsWith('/ws')) {
      wsUrl = wsUrl + '/ws';
    }

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this._connected = true;
        this.retryCount = 0;
        this.onConnected();
      };

      this.ws.onmessage = (event: any) => {
        try {
          const raw = typeof event.data === 'string' ? event.data : JSON.stringify(event.data);
          const data = JSON.parse(raw);

          if (data.type === 'chunk' && typeof data.content === 'string') {
            this.onChunk(data.content);
          } else if (data.type === 'done') {
            this.onDone();
          } else if (data.type === 'error') {
            this.onError(new Error(data.message || data.error || 'Gateway error'));
          }
        } catch {
          // Non-JSON or unexpected format — ignore silently
        }
      };

      this.ws.onerror = (_event: any) => {
        this._connected = false;
        this.onError(new Error('WebSocket connection error'));
      };

      this.ws.onclose = (_event: any) => {
        this._connected = false;
        this.onDisconnected();

        if (this._shouldReconnect && this.retryCount < MAX_RETRIES) {
          const delay = Math.min(
            BASE_RETRY_DELAY_MS * Math.pow(2, this.retryCount),
            MAX_RETRY_DELAY_MS
          );
          this.retryCount++;
          this.retryTimer = setTimeout(() => this._doConnect(), delay);
        }
      };
    } catch (err) {
      this._connected = false;
      this.onError(
        err instanceof Error ? err : new Error('Failed to create WebSocket connection')
      );
    }
  }

  /** Send a chat message over the WebSocket. */
  sendMessage(text: string): void {
    if (!this.ws || this.ws.readyState !== 1 /* OPEN */) {
      this.onError(new Error('Gateway is not connected. Check your Gateway URL in Settings.'));
      return;
    }

    this.ws.send(
      JSON.stringify({
        type: 'message',
        content: text,
        token: this._token,
      })
    );
  }

  /** Disconnect and stop all retries. */
  disconnect(): void {
    this._shouldReconnect = false;
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    if (this.ws) {
      try { this.ws.close(); } catch { /* ignore */ }
      this.ws = null;
    }
    this._connected = false;
  }

  get isConnected(): boolean {
    return this._connected && this.ws?.readyState === 1;
  }

  get currentUrl(): string {
    return this._url;
  }
}

// App-wide singleton
export const gatewayClient = new GatewayClient();
export default GatewayClient;

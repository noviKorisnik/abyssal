import { environment } from "../../environments/environment";

export class GameSocket {
    private ws: WebSocket | null = null;
    private gameId: string;
    private userId: string;

    constructor(gameId: string, userId: string) {
        this.gameId = gameId;
        this.userId = userId;
    }

    connect(onMessage: (data: any) => void, onOpen?: () => void, onClose?: () => void) {
        this.ws = new WebSocket(environment.wsBaseUrl);
        this.ws.onopen = () => {
            this.send({ type: 'join', gameId: this.gameId, userId: this.userId });
            if (onOpen) onOpen();
        };
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch {
                // handle parse error
            }
        };
        this.ws.onclose = () => {
            if (onClose) onClose();
        };
    }

    send(data: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

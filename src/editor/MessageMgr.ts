type MessageCallback = (...args: any[]) => void;

export class MessageMgr {
    private eventCallbacks: Map<string, MessageCallback[]> = new Map();

    public send(eventNames: string | string[], ...args: any[]): void {
        // 模拟发送消息的操作
        const events = Array.isArray(eventNames) ? eventNames : [eventNames];
        for (const eventName of events) {
            console.debug(`发送消息 (${eventName}) ${args.length > 0 ? ':' + JSON.stringify(args) : ''}`);

            // 触发特定事件的注册的回调函数来处理消息
            const callbacks = this.eventCallbacks.get(eventName);
            if (callbacks) {
                callbacks.forEach((callback) => {
                    callback(...args);
                });
            }
        }
    }

    public unregisterAll() {
        this.eventCallbacks.clear();
    }

    /**
     * 注册一个或多个事件的消息回调函数
     * @param eventNames
     * @param callback
     */
    public register(eventNames: string | string[], callback: MessageCallback): void {
        const events = Array.isArray(eventNames) ? eventNames : [eventNames];
        for (const eventName of events) {
            if (!this.eventCallbacks.has(eventName)) {
                this.eventCallbacks.set(eventName, []);
            }
            this.eventCallbacks.get(eventName)?.push(callback);
        }
    }

    /**
     * 取消注册一个或多个事件的消息回调函数
     * @param eventNames
     * @param callback
     */
    public unregister(eventNames: string | string[], callback: MessageCallback): void {
        const events = Array.isArray(eventNames) ? eventNames : [eventNames];
        for (const eventName of events) {
            const callbacks = this.eventCallbacks.get(eventName);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index !== -1) {
                    callbacks.splice(index, 1);
                }
            }
        }
    }

    public callSceneMethod(method: string, args?: any[]): Promise<any> {
        return Editor.Message.request("scene", "execute-scene-script", {
            name: "cclplugin",
            method: method,
            args: args || [],
        });
    }
}


export const messageMgr = new MessageMgr()
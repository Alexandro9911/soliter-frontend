type busEventType = {
	[key: string]: Function
}

class EventBus {
	private static instance: EventBus;
	private events: busEventType = {};

	private constructor() {}

	public static getInstance(): EventBus {
		if (!EventBus.instance) {
			EventBus.instance = new EventBus();
		}

		return EventBus.instance;
	}

	public on(event: string, callback: Function) {
		this.events[event] = callback;
	}

	public off(event: string) {
		delete this.events[event];
	}

	public emit(event: string, ...args: any[]) {
		if (event in this.events) {
			this.events[event](...args);
		}
	}
}

export default EventBus;

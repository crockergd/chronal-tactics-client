export default class CallbackBinding {
    constructor(public readonly callback: Function, public readonly context: any, public readonly key?: string) { }
    
    public call(...args: Array<any>): any {
        return this.callback.call(this.context, ...args);
    }
}
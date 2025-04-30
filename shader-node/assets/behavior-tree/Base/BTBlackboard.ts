export class Blackboard {
    map: { [key: string]: any } = {}

    Add(key: string, value: any) {
        this.map[key] = value;
    }

    Get(key: string) {
        return this.map[key];
    }

    Has(key: string) {
        return this.map[key] != undefined && this.map[key] != null;
    }

    Del(key: any) {
        delete this.map[key]
    }

    Clear() {
        this.map = {}
    }
}

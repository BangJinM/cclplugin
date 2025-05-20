import { BTVariable } from "../Variable/BTVariable";

export class BTBlackBoard {
    map: { [key: string]: BTVariable<any> } = {}

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

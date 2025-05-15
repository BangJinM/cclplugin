import { PropertyType } from "./PropertyType";

export abstract class BTVariable<T> {
    bName: string = "";
    bType: PropertyType = PropertyType.Float;
    value: T

    protected abstract GetDefaultValue(): T
    public abstract SetValue(value: T): void
    public abstract GetValue(): T
}
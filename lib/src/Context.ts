export class Context {
    private readonly map = new Map<DomainContext<any>, any>();

    constructor(private readonly parent?: Context | undefined) {}

    get<T>(c: DomainContext<T>): T {
        let existing = this.map.get(c);
        if (!existing) {
            existing = this.parent ? this.parent.get(c) : c.ctor();
            this.map.set(c, existing);
        }
        return existing;
    }

    withUpdated<T>(c: DomainContext<T>, update: (old: T) => T): Context {
        const updated = new Context(this);
        const old = this.get(c);
        updated.map.set(c, update(old));
        return updated;
    }
}

class DomainContext<T> {
    constructor(public readonly ctor: () => T) {}
}

export const objectContext = new DomainContext(() => new ObjectContext(0));

class ObjectContext {
    constructor(public readonly depth: number) {}

    public increaseDepth(): ObjectContext {
        return new ObjectContext(this.depth + 1);
    }
}

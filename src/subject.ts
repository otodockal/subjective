import {
    ObjectUnsubscribedError,
    Subject,
    Subscriber,
    Subscription,
} from 'rxjs';

export class _InternalSubject<T> extends Subject<T> {
    constructor(public value: T) {
        super();
    }

    /** @deprecated internal use only */ _subscribe(
        subscriber: Subscriber<T>,
    ): Subscription {
        const subscription = super._subscribe(subscriber);
        if (subscription && !subscription.closed) {
            subscriber.next(this.value);
        }
        return subscription;
    }

    getValue(): T {
        if (this.hasError) {
            throw this.thrownError;
        } else if (this.closed) {
            throw new ObjectUnsubscribedError();
        } else {
            return this.value;
        }
    }

    next(value: T): void {
        super.next((this.value = value));
    }
}

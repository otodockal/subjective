import {
    ObjectUnsubscribedError,
    Subject,
    Subscriber,
    Subscription,
    SubscriptionLike,
} from 'rxjs';

export class _InternalSubject<T> extends Subject<T> {
    constructor(public value: T) {
        super();
    }

    /** @deprecated This is an internal implementation detail, do not use. */
    _subscribe(subscriber: Subscriber<T>): Subscription {
        const subscription = super._subscribe(subscriber);
        if (subscription && !(<SubscriptionLike>subscription).closed) {
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

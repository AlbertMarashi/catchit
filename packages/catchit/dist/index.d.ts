declare type fnAny = () => any | Promise<any>;
export declare function runner(): {
    test: {
        (name: string, fn: fnAny): void;
        /**
         * A todo unit test that doesn't throw any errors
         *
         * Used for tests that still need to be done
         * @param name
         */
        todo(name: string): void;
    };
    it: {
        (name: string, fn: fnAny): void;
        /**
         * A todo unit test that doesn't throw any errors
         *
         * Used for tests that still need to be done
         * @param name
         */
        todo(name: string): void;
    };
    expect: (actual: any) => {
        toBe(expected: any): void;
    };
    describe: (name: string, fn: fnAny) => void;
    run(): Promise<void>;
};
export {};

import { runner } from '@framework-tools/catchit';
let { test, expect, run, describe } = runner();
describe('describe', () => {
    test('it can do this thing', () => {
        expect({ hello: 'world' }).toBe({ hello: 'earth' });
    });
    test('it can do this other thing', () => {
        expect({ hello: 'world' }).toBe({ hello: 'world' });
    });
});
describe('second describe', () => {
    test.todo('this is todo');
});
await run();
//# sourceMappingURL=index.js.map
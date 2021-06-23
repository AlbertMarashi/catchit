import concordance from 'concordance'
import concordanceOptions from './options.js'

let actual = concordance.describe({hell: 1})
console.log(actual)
let expected = concordance.describe({hell: 2})
let diff = concordance.diffDescriptors(actual, expected, concordanceOptions)

export function Runner () {
    let tests: {name: string, fn: () => any}[] = []

    function test(name: string, fn: () => any) {
        tests.push({ name, fn })
    }

    function expect(current: any) {
        let currentDescription = concordance.describe(current)
        return {
            toBe(expected: any) {
                let expectedDescription = concordance.describe(expected)
            }
        }
    }

    return {
        test,
        expect
    }
}

// concordance.compareDescriptors({hello: 'world'},{x: 'yz'})
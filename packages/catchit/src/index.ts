import { AssertionError } from 'assert/strict'
import concordance from 'concordance'
import concordanceOptions from './options.js'
import chalk from 'chalk'

class CatchitAssertionError extends AssertionError {
    diff: string

    constructor(message: string, actualDescriptor: any, expectedDescriptor: any) {
        super({message, actual: actualDescriptor.value, expected: expectedDescriptor.value})

        this.diff = concordance.diffDescriptors(actualDescriptor, expectedDescriptor, concordanceOptions)
    }
}

type fnAny = () => any | Promise<any>
type Test = {type: 'todo' | 'test', name: string, fn: fnAny}
type Describe = { type: 'describe', name: string, tests: TestOrDescribeArray}
type TestOrDescribeArray = (Test|Describe)[]

type TestFail = { type: 'fail', error: CatchitAssertionError, test: Test }
type TestPass = { type: 'pass', test: Test }
type TestTodo = { type: 'todo', test: Test }

type TestResult = TestFail | TestPass | TestTodo

export function runner () {
    let tests: TestOrDescribeArray = []
    let currentArray = tests
    /**
     * A unit test
     * @param name name of the test
     * @param fn callback for code to execute
     */
    function test(name: string, fn: fnAny) {
        currentArray.push({ type: 'test', name, fn })
    }

    function describe(name: string, fn: fnAny) {
        let describer: Describe = {
            type: 'describe',
            name,
            tests: []
        }

        currentArray.push(describer)
        let prevArray = currentArray

        currentArray = describer.tests

        fn()

        currentArray = prevArray
    }

    /**
     * A todo unit test that doesn't throw any errors
     * 
     * Used for tests that still need to be done
     * @param name 
     */
    test.todo = function(name: string) {
        currentArray.push({type: 'todo', name, fn: () => {}})
    }

    /**
     * Expect a certain value to equal the value of actual
     * 
     * @param actual any value
     * @returns 
     */
    function expect(actual: any) {
        let actualDescriptor = concordance.describe(actual)
        return {
            toBe(expected: any) {
                let expectedDescriptor = concordance.describe(expected)
                if(!concordance.compareDescriptors(actualDescriptor, expectedDescriptor, concordanceOptions)){
                    throw new CatchitAssertionError('Value is not expected value', actualDescriptor, expectedDescriptor)
                }
            }
        }
    }

    async function runTests(testsArray: TestOrDescribeArray, depth: number): Promise<TestResult[]> {
        let results: TestResult[] = []

        let indentation = new Array(depth * 2).fill(' ').join('')
        
        for (let testOrDescribe of testsArray) {
            if(testOrDescribe.type === 'describe') {
                
                console.log(indentation + `${testOrDescribe.name}`)
                results.push(...await runTests(testOrDescribe.tests, depth + 1))
            } else {
                try {
                    await testOrDescribe.fn()
                    if(testOrDescribe.type === 'test'){
                        console.log(indentation + `${chalk.greenBright(`✓`)} ${chalk.dim(testOrDescribe.name)}`)
                        results.push({ type: 'pass', test: testOrDescribe})
                    }else if (testOrDescribe.type === 'todo'){
                        console.log(indentation + `${chalk.magentaBright(`✎`)} ${chalk.dim(testOrDescribe.name)}`)
                        results.push({ type: 'todo', test: testOrDescribe})
                    }
                } catch (error) {
                    console.error(indentation + `${chalk.bold.redBright(`✕`)} ${chalk.dim.white(testOrDescribe.name)}`)
                    results.push({type: 'fail', error, test: testOrDescribe})
                }
            }
        }

        return results
    }

    return {
        test,
        it: test, // alias for test
        expect,
        describe,
        async run(){
            console.log('')
            let results = await runTests(tests, 0)
            let fails = results.filter(testResult => testResult.type == 'fail') as unknown as TestFail[]
            let todos = results.filter(testResult => testResult.type == 'todo') as unknown as TestTodo[]
            let passes = results.filter(testResult => testResult.type == 'pass') as unknown as TestPass[]

            console.log(chalk.bold.redBright(`\nGot test failures: ${fails.length}`))
            fails.map(failure => {
                console.log(chalk.bold.redBright(`\n● ${failure.test.name}\n`))
                if(failure.error instanceof CatchitAssertionError) {
                    console.log(failure.error.diff)
                } else {
                    console.error(failure.error)
                }
            })

            console.log(chalk.bold('\nTests:       ')
                + chalk.bold.redBright(fails.length + ' fails') + ', '
                + chalk.bold.magentaBright(todos.length + ' todos') + ', '
                + chalk.bold.greenBright(passes.length + ' passes') + ', '
                + (passes.length + todos.length + fails.length) + ' total'
            )
        }
    }
}
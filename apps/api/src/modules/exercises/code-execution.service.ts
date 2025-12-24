import { Injectable, Logger } from '@nestjs/common';
import { VM } from 'vm2';

interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

interface TestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  error?: string;
  description?: string;
}

interface ExecutionResult {
  allTestsPassed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  error?: string;
}

@Injectable()
export class CodeExecutionService {
  private readonly logger = new Logger(CodeExecutionService.name);

  async executeCode(code: string, testCases: TestCase[]): Promise<ExecutionResult> {
    const results: TestResult[] = [];
    let passedTests = 0;
    let failedTests = 0;

    try {
      for (const testCase of testCases) {
        try {
          const result = await this.runSingleTest(code, testCase);
          results.push(result);

          if (result.passed) {
            passedTests++;
          } else {
            failedTests++;
          }
        } catch (error) {
          this.logger.error(`Error running test case: ${error.message}`);
          results.push({
            passed: false,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: '',
            error: error.message,
            description: testCase.description,
          });
          failedTests++;
        }
      }

      return {
        allTestsPassed: failedTests === 0,
        totalTests: testCases.length,
        passedTests,
        failedTests,
        results,
      };
    } catch (error) {
      this.logger.error(`Error executing code: ${error.message}`);
      return {
        allTestsPassed: false,
        totalTests: testCases.length,
        passedTests: 0,
        failedTests: testCases.length,
        results: [],
        error: error.message,
      };
    }
  }

  private async runSingleTest(code: string, testCase: TestCase): Promise<TestResult> {
    const vm = new VM({
      timeout: 5000, // 5 second timeout
      sandbox: {},
      eval: false,
      wasm: false,
    });

    try {
      // Parse the input (could be JSON or simple value)
      let input;
      try {
        input = JSON.parse(testCase.input);
      } catch {
        input = testCase.input;
      }

      // Create a wrapper that calls the user's function
      const wrappedCode = `
        ${code}

        // Call the main function (assuming it's exported or defined)
        const input = ${JSON.stringify(input)};
        const result = typeof solution === 'function' ? solution(input) : eval(solution);
        JSON.stringify(result);
      `;

      const actualOutput = vm.run(wrappedCode);
      const normalizedActual = this.normalizeOutput(actualOutput);
      const normalizedExpected = this.normalizeOutput(testCase.expectedOutput);

      const passed = normalizedActual === normalizedExpected;

      return {
        passed,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput,
        description: testCase.description,
      };
    } catch (error) {
      return {
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: '',
        error: error.message,
        description: testCase.description,
      };
    }
  }

  private normalizeOutput(output: string): string {
    try {
      // Try to parse as JSON and stringify to normalize
      const parsed = JSON.parse(output);
      return JSON.stringify(parsed);
    } catch {
      // If not JSON, trim whitespace
      return output.toString().trim();
    }
  }
}

import type { Config } from 'jest'

const config: Config = {
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^.+\\.(svg)$': '<rootDir>/.jest/svg-mock.js',
    },
    setupFiles: ['<rootDir>/.jest/setup.jest.js'],
    testMatch: [
        '<rootDir>/src/**/?(*.)+(spec|test).[tj]s?(x)',
        '<rootDir>/.jest/**/?(*.)+(spec|test).[tj]s?(x)',
    ],
    extensionsToTreatAsEsm: ['.ts'],
    preset: 'ts-jest',
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
}

export default config

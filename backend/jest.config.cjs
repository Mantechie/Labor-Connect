module.exports = {
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.js'],
  globals: {
    'babel-jest': {
      useESM: true,
    },
  },
  moduleFileExtensions: ['js', 'json', 'jsx', 'node'],
};

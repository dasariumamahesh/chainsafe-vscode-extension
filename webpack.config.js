//@ts-check
'use strict';

const path = require('path');
const webpack = require('webpack');

/** @type {import('webpack').Configuration} */
const config = {
  target: 'node',
  mode: 'production',
  entry: {
    extension: './extension.js',
    // Add transformer and other node modules we want to bundle
    'node_modules/chainsafe/index': 'chainsafe',
    'node_modules/diff/dist/diff': 'diff'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    // Ensure proper path resolution for node modules
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  externals: {
    // Only exclude vscode and core Node.js modules
    vscode: 'commonjs vscode',
    'child_process': 'commonjs child_process',
    'fs': 'commonjs fs',
    'path': 'commonjs path'
  },
  resolve: {
    extensions: ['.js'],
    modules: ['node_modules', '.'], // Added '.' to resolve local files
    mainFields: ['main'],
  },
  optimization: {
    minimize: true,
    // Ensure modules are bundled together
    concatenateModules: true,
  },
  plugins: [
    // Add source map support
    new webpack.SourceMapDevToolPlugin({
      filename: '[name].js.map'
    }),
    // Ensure proper module bundling
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    // Define necessary globals
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ],
  // Enable detailed error messages
  stats: {
    errorDetails: true
  },
  // Add source map support
  devtool: 'source-map'
};

module.exports = config;
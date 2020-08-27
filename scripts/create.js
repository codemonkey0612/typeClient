const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const childprocess = require('child_process');
const prompt = inquirer.createPromptModule();

prompt([{
  type: 'input',
  name: 'project',
  message: '请输入项目名称'
}]).then(data => {
  const dir = createProjectDir(data.project);
  createTypeScriptConfigFile(dir);
  createPackageFile(dir, data.project);
  createRollup(dir);
  createReadme(dir, data.project);
  const src = createDir(dir, 'src');
  const test = createDir(dir, '__tests__');
  createIndexFile(src, data.project);
  createTestFile(test, data.project);
  createWebpackConfigFile(dir);
  createDevFiles(dir);
  childprocess.spawn('lerna', ['bootstrap'], {
    stdio: 'inherit'
  });
});

function createProjectDir(name) {
  const dir = path.resolve(process.cwd(), 'packages', name);
  fs.mkdirSync(dir);
  return dir;
}

function createTypeScriptConfigFile(dir) {
  const template = {
    "extends": "../../tsconfig.json",
    "extendsExact": true,
    "compilerOptions": {
      "declaration": true,
      "outDir": "dist",
    },
    "include": ["src"]
  }
  fs.writeFileSync(path.resolve(dir, 'tsconfig.json'), JSON.stringify(template, null, 2), 'utf8');
}

function createPackageFile(dir, project) {
  const template = {
    "name": "@typeclient/" + project,
    "version": "1.0.0",
    "description": "typeclient " + project,
    "author": "",
    "homepage": "https://github.com/flowxjs/TypeClient",
    "license": "MIT",
    "main": "dist/index.js",
    "module": "dist/index.es.js",
    "directories": {
      "lib": "src",
      "test": "__tests__"
    },
    "files": [
      "dist"
    ],
    "scripts": {
      "build": "rollup -c",
      "dev": "../../node_modules/.bin/webpack-dev-server --open --hot --progress --history-api-fallback"
    },
    "publishConfig": {
      "access": "public"
    }
  }
  fs.writeFileSync(path.resolve(dir, 'package.json'), JSON.stringify(template, null, 2), 'utf8');
}

function createReadme(dir, project) {
  template = `# \`${project}\`

  > TODO: description
  
  ## Usage
  
  \`\`\`
  const container = require('@typeclient/${project}');
  
  // TODO: DEMONSTRATE API
  \`\`\``;
  fs.writeFileSync(path.resolve(dir, 'README.md'), template, 'utf8');
}

function createDir(dir, name) {
  const _dir = path.resolve(dir, name);
  fs.mkdirSync(_dir);
  return _dir;
}

function createIndexFile(src, project) {
  const name = project[0].toUpperCase() + project.substring(1);
  fs.writeFileSync(path.resolve(src, 'index.ts'), `export const abc = 1;`, 'utf8');
}

function createTestFile(test, project) {
  fs.writeFileSync(path.resolve(test, project + '.test.ts'), `import * as core from '../src';

  describe('core', () => {
      it('needs tests');
  });
  `, 'utf8');
}

function createRollup(dir) {
  const template = `import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named'
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named'
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
plugins: [
    typescript({
      typescript: require('typescript'),
    }),
  ],
}`;
  fs.writeFileSync(path.resolve(dir, 'rollup.config.js'), template, 'utf8');
}

function createWebpackConfigFile(dir) {
  const template = `const path = require('path');
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  
  module.exports = {
    mode: 'development',
    entry: {
      app: resolve('./dev/index.ts')
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Development',
        template: resolve('./dev/index.html')
      })
    ],
    resolve: {
      extensions: [".ts", ".tsx", ".js"]
    },
    module: {
      rules: [
        // all files with a \`.ts\` or \`.tsx\` extension will be handled by \`ts-loader\`
        { test: /\.tsx?$/, loader: "ts-loader" }
      ]
    },
    output: {
      filename: '[name].bundle.[hash:10].js',
      path: resolve('dist'),
      publicPath: '/'
    },
    devServer: {
      historyApiFallback: true,
      contentBase: resolve('dist'),
      port: 9000
    }
  };
  
  function resolve(uri) {
    return path.resolve(__dirname, uri);
  }`;
  fs.writeFileSync(path.resolve(dir, 'webpack.config.js'), template, 'utf8');
}

function createDevFiles(dir) {
  const html = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta http-equiv="Expires" content="0">
      <meta http-equiv="Pragma" content="no-cache">
      <meta http-equiv="Cache-control" content="no-cache">
      <meta http-equiv="Cache" content="no-cache">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
      <title>Monitor test</title>
    </head>
    <body>
      <noscript>
        <strong>We're sorry but program doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
      </noscript>
      <div id="app"></div>
      <!-- built files will be auto injected -->
    </body>
  </html>`;
  const script = `const a = 1;`;
  const _dir = path.resolve(dir, 'dev');
  fs.mkdirSync(_dir);
  fs.writeFileSync(path.resolve(_dir, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.resolve(_dir, 'index.ts'), script, 'utf8');
}
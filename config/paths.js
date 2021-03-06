'use strict';

const path = require('path');
const glob = require('glob');
const fs = require('fs');
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');

const isEnvDevelopment = process.env.NODE_ENV === "development";

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());

const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
const publicUrlOrPath = getPublicUrlOrPath(
	isEnvDevelopment,
	require(resolveApp('package.json')).homepage,
	process.env.PUBLIC_URL
);

const moduleFileExtensions = [
	'web.mjs', 'mjs', 'web.js', 'js',
	'web.ts', 'ts', 'web.tsx', 'tsx',
	'json', 'web.jsx', 'jsx',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
	const extension = moduleFileExtensions.find(extension =>
		fs.existsSync(resolveFn(`${filePath}.${extension}`))
	);

	if (extension) {
		return resolveFn(`${filePath}.${extension}`);
	}
	return resolveFn(`${filePath}.js`);
};

const getPluginEntries = function () {
	const pluginRoot = resolveApp('src/plugins');
	return glob.sync(pluginRoot + '/*/*.tsx').reduce((acc, filePath) => {
		const fileName = filePath.replace(/.*\/(\w+)\/\w+(\.html|\.tsx)$/, (rs, $1) => $1);
		return {
			...acc,
			[fileName]: [
				filePath,
				isEnvDevelopment && require.resolve('react-dev-utils/webpackHotDevClient')
			].filter(Boolean),
		};
	}, {});
};

const getAppEntries = function () {
	return {
		...getPluginEntries(),
		main: [
			resolveModule(resolveApp, 'src/index'),
			isEnvDevelopment && require.resolve('react-dev-utils/webpackHotDevClient')
		].filter(Boolean),
	};
};

// config after eject: we're in ./config/
module.exports = {
	dotenv: resolveApp('.env'),
	appPath: resolveApp('.'),
	appBuild: resolveApp('build'),
	appPublic: resolveApp('public'),
	appHtml: resolveApp('public/index.html'),
	appIndexJs: resolveModule(resolveApp, 'src/index'),
	appEntries: getAppEntries(),
	appPackageJson: resolveApp('package.json'),
	appSrc: resolveApp('src'),
	appTsConfig: resolveApp('tsconfig.json'),
	appJsConfig: resolveApp('jsconfig.json'),
	yarnLockFile: resolveApp('yarn.lock'),
	testsSetup: resolveModule(resolveApp, 'src/setupTests'),
	proxySetup: resolveApp('src/setupProxy.js'),
	appNodeModules: resolveApp('node_modules'),
	publicUrlOrPath,
};

module.exports.moduleFileExtensions = moduleFileExtensions;

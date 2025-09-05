const { withModuleFederationPlugin, shareAll } = require('@angular-architects/module-federation/webpack');

const baseConfig = withModuleFederationPlugin({
  name: 'taskflow-reactive',
  filename: 'remoteEntry.js',
  exposes: {
    './RealTimeCollaborationComponent': './src/app/features/realtime-collaboration/realtime-collaboration.component.ts',
    './ReactiveRootComponent': './src/app/app.component.ts'
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: false, requiredVersion: false, eager: false }),
  },
});

module.exports = {
  ...baseConfig,

  output: {
    ...baseConfig.output,
    publicPath: "https://taskflow-reactive.netlify.app/",
    uniqueName: "taskflow-reactive"
  },

  optimization: {
    ...baseConfig.optimization,
    runtimeChunk: false
  },
};

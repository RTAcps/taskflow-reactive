const { withModuleFederationPlugin, shareAll } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  output: {
    publicPath: "https://taskflow-component.netlify.app/"
  },

  name: 'taskflowReactive',
  filename: 'remoteEntry.js',
  exposes: {
    './RealTimeCollaborationComponent': './src/app/features/realtime-collaboration/realtime-collaboration.component.ts',
    './ReactiveRootComponent': './src/app/app.component.ts'
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: false, requiredVersion: false, eager: false }),
  },
  library: { type: 'var', name: 'taskflowReactive' },
});

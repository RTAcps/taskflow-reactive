const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'taskflowReactive',
  exposes: {
    './RealTimeCollaborationComponent': './src/app/features/realtime-collaboration/realtime-collaboration.component.ts',
    './ReactiveRootComponent': './src/app/app.component.ts'
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
});

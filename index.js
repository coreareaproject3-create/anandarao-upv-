/**
 * Native Entry Point for Android/iOS
 * Use this when running 'npx react-native run-android'
 */
import { AppRegistry } from 'react-native';
import MobileApp from './src/MobileApp';
import appConfig from './app.json';

AppRegistry.registerComponent(appConfig.name, () => MobileApp);

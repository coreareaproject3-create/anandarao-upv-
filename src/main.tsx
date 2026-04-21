import { AppRegistry } from 'react-native';
import MobileApp from './MobileApp.tsx';
import './index.css';

AppRegistry.registerComponent('App', () => MobileApp);
AppRegistry.runApplication('App', {
  initialProps: {},
  rootTag: document.getElementById('root')!,
});

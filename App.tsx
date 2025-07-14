import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { DocumentProvider } from './src/context/DocumentContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import UploadScreen from './src/screens/UploadScreen';
import SearchScreen from './src/screens/SearchScreen';
import PreviewScreen from './src/screens/PreviewScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <DocumentProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'Document Management' }} 
            />
            {/* <Stack.Screen 
              name="Upload" 
              component={UploadScreen} 
              options={{ title: 'Upload Document' }} 
            /> */}
            <Stack.Screen 
              name="Search" 
              component={SearchScreen} 
              options={{ title: 'Search Documents' }} 
            />
            {/* <Stack.Screen 
              name="Preview" 
              component={PreviewScreen} 
              options={{ title: 'Document Preview' }} 
            /> */}
          </Stack.Navigator>
        </NavigationContainer>
      </DocumentProvider>
    </AuthProvider>
  );
};

export default App;
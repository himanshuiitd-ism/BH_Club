// utils/cleanup.js
import { cleanupInvalidPosts } from '../redux/postSlice';
import store  from '../redux/store.js';

export const cleanupInvalidData = () => {
  // Clean up posts with null authors
  store.dispatch(cleanupInvalidPosts());
  
  // You can add more cleanup logic here for other invalid data
};

//this will help to clean up all those users who have deleted their account , ErrorBoundary in component is doing same work but only for post(removes post of deleted user) and this is doing same work for whole app.
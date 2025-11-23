// src/hooks/useUsers.ts
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { 
  fetchAllUsers, 
  fetchCurrentUser, 
  searchUsers,
  clearUsers,
} from '../feature/users/usersSlice';
import type { User } from '../types';

export const useUsers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const usersState = useSelector((state: RootState) => state.users);
  const isInitialized = useRef(false);

  const loadUsers = useCallback((params?: { search?: string; exclude?: string[] }) => {
    dispatch(fetchAllUsers(params));
  }, [dispatch]);

  const loadCurrentUser = useCallback(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  const handleSearchUsers = useCallback((query: string, exclude: string[] = []) => {
    if (query.trim().length < 2) {
      dispatch(fetchAllUsers({ exclude }));
      return;
    }
    
    dispatch(searchUsers({ query: query.trim(), exclude }));
  }, [dispatch]);

  const handleClearUsers = useCallback(() => {
    dispatch(clearUsers());
  }, [dispatch]);

  const getUserById = useCallback((userId: string): User | undefined => {
    return usersState.users.find(user => user._id === userId);
  }, [usersState.users]);

  const getUsersExcluding = useCallback((excludeIds: string[] = []): User[] => {
    return usersState.users.filter(user => !excludeIds.includes(user._id));
  }, [usersState.users]);

  useEffect(() => {
    if (!isInitialized.current && !usersState.currentUser && !usersState.loading) {
      isInitialized.current = true;
    }
  }, []);

  return {
    // State
    users: usersState.users,
    currentUser: usersState.currentUser,
    loading: usersState.loading,
    error: usersState.error,

    // Actions
    loadUsers,
    loadCurrentUser,
    searchUsers: handleSearchUsers,
    clearUsers: handleClearUsers,

    // Utilities
    getUserById,
    getUsersExcluding,
  };
};
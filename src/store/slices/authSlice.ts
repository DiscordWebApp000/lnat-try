import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserProfile } from '@/types/user';
import { authService, userService } from '@/lib/firebase-services';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  users: User[];
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  users: [],
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const user = await authService.login(email, password);
    const profile = await userService.getUserProfile(user.uid);
    return { user, profile };
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, firstName, lastName }: { email: string; password: string; firstName: string; lastName: string }) => {
    const user = await authService.register(email, password, firstName, lastName);
    const profile = await userService.getUserProfile(user.uid);
    return { user, profile };
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ uid, profile }: { uid: string; profile: Partial<UserProfile> }) => {
    const updatedProfile = await userService.updateUserProfile(uid, profile);
    return updatedProfile;
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string) => {
    await authService.resetPassword(email);
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
    await userService.updatePassword(currentPassword, newPassword);
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (uid: string) => {
    const user = await userService.getUser(uid);
    return user;
  }
);

export const fetchAllUsers = createAsyncThunk(
  'auth/fetchAllUsers',
  async () => {
    const users = await userService.getAllUsers();
    return users;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.profile = null;
      state.users = [];
      state.isAuthenticated = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.users = [];
        state.isAuthenticated = false;
        state.error = null;
      });

    // Update Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Profile update failed';
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Password reset failed';
      });

    // Update Password
    builder
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Password update failed';
      });

    // Fetch User Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user profile';
      });

    // Fetch All Users
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      });
  },
});

export const { setUser, setProfile, clearAuth, setError, clearError } = authSlice.actions;
export default authSlice.reducer;

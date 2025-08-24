import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Permission } from '@/types/user';
import { permissionService } from '@/lib/firebase-services';

interface PermissionsState {
  permissions: Permission[];
  userPermissions: string[]; // Array of permission IDs
  loading: boolean;
  error: string | null;
}

const initialState: PermissionsState = {
  permissions: [],
  userPermissions: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllPermissions = createAsyncThunk(
  'permissions/fetchAll',
  async () => {
    const permissions = await permissionService.getAllPermissions();
    return permissions;
  }
);

export const fetchUserPermissions = createAsyncThunk(
  'permissions/fetchUserPermissions',
  async (userId: string) => {
    console.log('🔍 fetchUserPermissions called for userId:', userId);
    const userPermissions = await permissionService.getUserPermissions(userId);
    console.log('🔍 User permissions fetched:', userPermissions);
    return userPermissions;
  }
);



export const grantPermission = createAsyncThunk(
  'permissions/grant',
  async ({ userId, permissionId, grantedBy }: { 
    userId: string; 
    permissionId: string; 
    grantedBy: string; 
  }) => {
    const userPermission = await permissionService.grantPermission(userId, permissionId, grantedBy);
    return userPermission;
  }
);

export const revokePermission = createAsyncThunk(
  'permissions/revoke',
  async ({ userId, permissionId }: { userId: string; permissionId: string }) => {
    await permissionService.revokePermission(userId, permissionId);
    return { userId, permissionId };
  }
);

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    clearPermissions: (state) => {
      state.permissions = [];
      state.userPermissions = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all permissions
    builder
      .addCase(fetchAllPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
        state.error = null;
      })
      .addCase(fetchAllPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch permissions';
      });

    // Fetch user permissions
    builder
      .addCase(fetchUserPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.userPermissions = action.payload;
        state.error = null;
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user permissions';
      });



    // Grant permission
    builder
      .addCase(grantPermission.fulfilled, () => {
        // Permission granted, but no payload returned
        // State will be updated when permissions are refreshed
      });

    // Revoke permission
    builder
      .addCase(revokePermission.fulfilled, (state, action) => {
        state.userPermissions = state.userPermissions.filter(
          permissionId => permissionId !== action.payload.permissionId
        );
      });
  },
});

export const { clearPermissions, clearError } = permissionsSlice.actions;
export default permissionsSlice.reducer;

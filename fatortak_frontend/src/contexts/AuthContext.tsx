import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthResponseDto, UserDto, TenantDto } from "../types/api";
import { apiClient, ServiceResult } from "../services/api";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: UserDto | null;
  tenant: TenantDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<ServiceResult<any>>;
  logout: () => void;
  switchTenant: (tenantId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [tenant, setTenant] = useState<TenantDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const isAuthenticated = !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("auth_token");
      const userData = localStorage.getItem("user_data");
      const tenantData = localStorage.getItem("tenant_data");

      if (token && userData) {
        try {
          apiClient.setToken(token);
          setUser(JSON.parse(userData));
          if (tenantData) {
            setTenant(JSON.parse(tenantData));
          }
        } catch (error) {
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await apiClient.post<any>("/api/auth/login", {
        email,
        password,
      });

      if (result.success && result.data) {
        queryClient.clear();

        const { token, user: userData, tenant: tenantData } = result.data;

        localStorage.setItem("auth_token", token);
        localStorage.setItem("user_data", JSON.stringify(userData));
        if (tenantData) {
          localStorage.setItem("tenant_data", JSON.stringify(tenantData));
        }

        apiClient.setToken(token);
        setUser(userData);
        setTenant(tenantData);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const register = async (data: any): Promise<ServiceResult<any>> => {
    try {
      const result = await apiClient.post<ServiceResult<any>>(
        "/api/auth/register",
        data
      );

      // Check if the request was successful
      if (result.success && result.data) {
        const { token, user: userData, tenant: tenantData } = result.data;

        localStorage.setItem("auth_token", token);
        localStorage.setItem("user_data", JSON.stringify(userData));
        if (tenantData) {
          localStorage.setItem("tenant_data", JSON.stringify(tenantData));
        }

        apiClient.setToken(token);
        setUser(userData);
        setTenant(tenantData);
        return result;
      } else {
        // Return the error response from the server
        return result;
      }
    } catch (error: any) {
      // Handle network errors or other exceptions
      return {
        success: false,
        data: null,
        errorMessage: error.message || "Registration failed",
        errors: null,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("tenant_data");
    apiClient.clearToken();
    queryClient.clear();
    setUser(null);
    setTenant(null);
  };

  const switchTenant = async (tenantId: string): Promise<boolean> => {
    try {
      const result = await apiClient.post<any>("/api/auth/switch-tenant", {
        tenantId,
      });

      if (result.success && result.data) {
        const { token, user: userData, tenant: tenantData } = result.data;

        localStorage.setItem("auth_token", token);
        localStorage.setItem("user_data", JSON.stringify(userData));
        localStorage.setItem("tenant_data", JSON.stringify(tenantData));

        apiClient.setToken(token);
        setUser(userData);
        setTenant(tenantData);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        switchTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AvatarFallback } from "./AvatarFallback";
import { AvatarOperationalState } from "../../types/avatar";

interface Props {
  children: ReactNode;
  state?: AvatarOperationalState;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
}

export class AvatarErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Avatar WebGL 3D Error Caught:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <AvatarFallback
          state={this.props.state || "IDLE"}
          reason={`3D Subsystem Recovered: ${this.state.errorMessage || "Graphics context reset"}`}
        />
      );
    }

    return this.props.children;
  }
}

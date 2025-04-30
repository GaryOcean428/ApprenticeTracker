import React, { ComponentType } from 'react';
import { useRoute } from 'wouter';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ValidationOptions {
  /**
   * Zod schema for validating route parameters
   */
  schema: z.ZodObject<any>;
  /**
   * URL to redirect to if validation fails
   */
  redirectTo: string;
  /**
   * Override the default error message
   */
  errorMessage?: string;
}

type RouteParams = Record<string, string>;

/**
 * Higher-order component that validates route parameters
 * using a Zod schema before rendering the wrapped component
 */
export function withRouteValidation<P extends object>(
  Component: ComponentType<P>,
  options: ValidationOptions
): ComponentType<P> {
  const { schema, redirectTo, errorMessage } = options;
  
  function ValidatedRoute(props: P) {
    // Get route parameters
    const [, params] = useRoute<RouteParams>(window.location.pathname);
    
    // If params is undefined, provide an empty object to avoid runtime errors
    const paramsToValidate = params || {};
    
    const validationResult = schema.safeParse(paramsToValidate);
    
    if (!validationResult.success) {
      console.error('Route parameter validation failed:', validationResult.error);
      
      // Return custom error UI
      return (
        <Card className="w-full max-w-3xl mx-auto my-8 border-destructive">
          <CardHeader className="bg-red-50 dark:bg-red-900/20">
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {errorMessage || "Invalid Route Parameters"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4">
              The URL parameters for this page are invalid or missing required values.
            </p>
            <Button onClick={() => window.location.href = redirectTo}>
              Return to Safe Page
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    // Merge validated params with props and pass to the component
    return <Component {...props} params={params} />;
  }

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  ValidatedRoute.displayName = `WithRouteValidation(${displayName})`;
  
  return ValidatedRoute;
}

/**
 * Validates that an ID parameter is a positive integer
 */
export const idParamSchema = z.object({
  id: z.string().refine(
    (val) => /^\d+$/.test(val) && parseInt(val) > 0,
    { message: "ID must be a positive integer" }
  )
});

/**
 * Validates that an ID parameter is either a positive integer or undefined
 * This is useful for routes that can be accessed with or without an ID
 */
export const optionalIdParamSchema = z.object({
  id: z.string().optional().refine(
    (val) => val === undefined || (/^\d+$/.test(val) && parseInt(val) > 0),
    { message: "If provided, ID must be a positive integer" }
  )
});

/**
 * Helper function specifically for validating ID params
 */
export function withIdValidation<P extends object>(
  Component: ComponentType<P>,
  redirectTo: string = "/",
  errorMessage?: string
): ComponentType<P> {
  return withRouteValidation(Component, {
    schema: idParamSchema,
    redirectTo,
    errorMessage
  });
}

/**
 * Helper function for validating optional ID params
 */
export function withOptionalIdValidation<P extends object>(
  Component: ComponentType<P>,
  redirectTo: string = "/",
  errorMessage?: string
): ComponentType<P> {
  return withRouteValidation(Component, {
    schema: optionalIdParamSchema,
    redirectTo,
    errorMessage
  });
}
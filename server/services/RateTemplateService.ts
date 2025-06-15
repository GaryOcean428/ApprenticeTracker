import { db } from "../db";
import {
  rateTemplatesTable,
  rateTemplateComponentsTable,
  rateActivityLogsTable,
} from "../../shared/schema/rate-templates";
import { users } from "../../shared/schema"; // Corrected import for users table
import { logger } from "../utils/logger";
import { eq, and, desc, isNull, asc, getTableColumns } from "drizzle-orm";
import { FairWorkApiClient, PayRate, Allowance } from "./fairwork/api-client"; // Actual import
import LRUCache from 'lru-cache'; // Added for caching

// Interfaces
export interface RateTemplateData {
  name: string;
  description?: string | null;
  organization_id?: number | null;
  status: "draft" | "active" | "archived";
  effective_from?: Date | string | null;
  effective_to?: Date | string | null;
  config_details?: any | null; // JSONB
  version?: number; // Should be handled by the service, not directly by client
}

export interface RateTemplate extends RateTemplateData {
  id: number;
  version: number;
  created_by_user_id?: number | null;
  updated_by_user_id?: number | null;
  created_at: Date;
  updated_at: Date;
}

// Placeholder interfaces for future methods
// export interface CalculationResult { // Now defined below
//   calculatedRate: number;
//   breakdown: any;
//   // ... other calculation details
// }

// --- Calculation Interfaces ---
export interface CalculationComponentResult {
  component_id: number;
  component_name: string | null;
  component_type: string;
  value_applied: number; // The actual monetary value this component contributed
  details: string; // e.g., "Fixed value", "10% of Base", "Award Allowance: Tool Allowance"
}

export interface CalculationResult {
  template_id: number;
  final_rate: number;
  breakdown: CalculationComponentResult[];
  warnings: string[];
  calculation_context?: any; // The context used for the calculation
}

// Assuming conditions structure could be like:
// { "day_of_week": ["Saturday", "Sunday"], "min_age": 21, "is_public_holiday": true, "time_of_day_between": ["18:00", "06:00"] }
export interface ComponentConditions {
  day_of_week?: string | string[];
  min_age?: number;
  max_age?: number;
  min_hours_in_shift?: number;
  max_hours_in_shift?: number;
  is_public_holiday?: boolean;
  time_of_day_between?: [string, string]; // [from, to] e.g., ["18:00", "06:00"]
  // ... other potential conditions
}

export interface ValidationResult {
  template_id: number;
  is_compliant: boolean;
  template_rate: number | null;
  official_minimum_rate: number | null;
  difference: number | null; // template_rate - official_minimum_rate
  award_details: string; // e.g., "MA000025 - Classification C10"
  effective_date: string;
  warnings: string[];
  validation_context?: any; // Echo back the context for reference
}

// Rate Template Component Interfaces
export interface RateTemplateComponentData {
  rate_template_id: number;
  component_type: string;
  component_name?: string | null;
  value_source_table?: string | null;
  value_identifier?: string | null;
  fixed_value_numeric?: string | number | null; // Drizzle expects string for decimal
  percentage_value_numeric?: string | number | null; // Drizzle expects string for decimal
  based_on_component_id?: number | null;
  conditions?: any | null; // JSONB
  notes?: string | null;
  order?: number | null;
}

export interface RateTemplateComponent extends RateTemplateComponentData {
  id: number;
  created_at: Date;
  updated_at: Date;
}

export class RateTemplateService {
  private readonly fairWorkApiClient: FairWorkApiClient;
  private templateCache: LRUCache<number, RateTemplate>;

  constructor() {
    this.fairWorkApiClient = new FairWorkApiClient({
      apiKey: process.env.FAIRWORK_API_KEY || "",
      baseUrl: process.env.FAIRWORK_API_URL || "https://api.fwc.gov.au/api/v1",
    });

    const cacheOptions: LRUCache.Options<number, RateTemplate, unknown> = {
      max: 100, // Max 100 templates in cache
      ttl: 3600000, // 1 hour
    };
    this.templateCache = new LRUCache(cacheOptions);
  }

  private async _logActivity(
    userId: number,
    activityType: string,
    templateId?: number,
    details?: any,
    targetEntity?: string, // For component-specific logs
    targetEntityId?: number // For component-specific logs
  ) {
    try {
      await db.insert(rateActivityLogsTable).values({
        user_id: userId,
        activity_type: activityType,
        rate_template_id: templateId,
        details: details || {},
        timestamp: new Date(),
        target_entity: targetEntity,
        target_entity_id: targetEntityId,
      });
    } catch (error) {
      logger.error(
        `Failed to log activity: ${activityType} for template ${templateId} (entity: ${targetEntity}/${targetEntityId}) by user ${userId}`,
        error
      );
      // Depending on requirements, you might want to re-throw or handle this error
    }
  }

  async createRateTemplate(
    data: RateTemplateData,
    userId: number
  ): Promise<RateTemplate> {
    const effectiveFrom = data.effective_from
      ? new Date(data.effective_from)
      : null;
    const effectiveTo = data.effective_to
      ? new Date(data.effective_to)
      : null;

    const [newTemplate] = await db
      .insert(rateTemplatesTable)
      .values({
        ...data,
        effective_from: effectiveFrom,
        effective_to: effectiveTo,
        version: 1, // Initial version
        created_by_user_id: userId,
        updated_by_user_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    if (!newTemplate) {
      logger.error("Failed to create rate template", data);
      throw new Error("Rate template creation failed.");
    }

    await this._logActivity(
      userId,
      "TEMPLATE_CREATED",
      newTemplate.id,
      { name: newTemplate.name, status: newTemplate.status }
    );
    return newTemplate as RateTemplate;
  }

  async getRateTemplateById(
    templateId: number
  ): Promise<RateTemplate | null> {
    const cachedTemplate = this.templateCache.get(templateId);
    if (cachedTemplate) {
      logger.debug(`Template ${templateId} found in cache.`);
      return cachedTemplate;
    }

    logger.debug(`Template ${templateId} not in cache, fetching from DB.`);
    const [templateFromDB] = await db
      .select()
      .from(rateTemplatesTable)
      .where(eq(rateTemplatesTable.id, templateId));

    if (templateFromDB) {
      this.templateCache.set(templateId, templateFromDB as RateTemplate);
      logger.debug(`Template ${templateId} fetched from DB and cached.`);
      return templateFromDB as RateTemplate;
    }

    return null;
  }

  async getAllRateTemplates(
    organizationId?: number
  ): Promise<RateTemplate[]> {
    const query = db
      .select()
      .from(rateTemplatesTable)
      .orderBy(desc(rateTemplatesTable.updated_at), asc(rateTemplatesTable.name));

    if (organizationId !== undefined) {
      return (await query.where(
        eq(rateTemplatesTable.organization_id, organizationId)
      )) as RateTemplate[];
    }
    return (await query) as RateTemplate[];
  }

  async updateRateTemplate(
    templateId: number,
    data: Partial<RateTemplateData>,
    userId: number
  ): Promise<RateTemplate | null> {
    // Invalidate cache before fetching, or after successful update.
    // Invalidating after ensures that if the update fails, the old cache entry might still be there.
    // However, typical pattern is to invalidate after successful DB operation.

    const currentTemplate = await this.getRateTemplateById(templateId); // This will use cache if available for the initial check
    if (!currentTemplate) {
      return null;
    }

    const effectiveFrom = data.effective_from
      ? new Date(data.effective_from)
      : currentTemplate.effective_from;
    const effectiveTo = data.effective_to
      ? new Date(data.effective_to)
      : currentTemplate.effective_to;

    const newVersion = (currentTemplate.version || 0) + 1;

    const [updatedTemplate] = await db
      .update(rateTemplatesTable)
      .set({
        ...data,
        effective_from: effectiveFrom,
        effective_to: effectiveTo,
        version: newVersion,
        updated_by_user_id: userId,
        updated_at: new Date(),
      })
      .where(eq(rateTemplatesTable.id, templateId))
      .returning();

    if (!updatedTemplate) {
      logger.warn(`Update failed for rate template ID: ${templateId} by user ID: ${userId}`);
      return null;
    }

    this.templateCache.delete(templateId);
    logger.debug(`Cache invalidated for template ${templateId} after update.`);

    // Simple logging, could be expanded to include changed fields
    await this._logActivity(
      userId,
      "TEMPLATE_UPDATED",
      updatedTemplate.id,
      { oldVersion: currentTemplate.version, newVersion: updatedTemplate.version, changes: data }
    );

    return updatedTemplate as RateTemplate;
  }

  async archiveRateTemplate(
    templateId: number,
    userId: number
  ): Promise<boolean> {
    const [updatedTemplate] = await db
      .update(rateTemplatesTable)
      .set({
        status: "archived",
        effective_to: new Date(), // Set effective_to to now
        updated_by_user_id: userId,
        updated_at: new Date(),
      })
      .where(eq(rateTemplatesTable.id, templateId))
      .returning({ id: rateTemplatesTable.id }); // Only need to know if it was updated

    if (!updatedTemplate) {
      logger.warn(`Archive failed for rate template ID: ${templateId}, template not found or no change.`);
      return false;
    }

    this.templateCache.delete(templateId);
    logger.debug(`Cache invalidated for template ${templateId} after archive.`);

    await this._logActivity(userId, "TEMPLATE_ARCHIVED", templateId);
    return true;
  }

  async unarchiveRateTemplate(
    templateId: number,
    userId: number
  ): Promise<boolean> {
    const [updatedTemplate] = await db
      .update(rateTemplatesTable)
      .set({
        status: "draft", // Or 'active' based on specific logic, 'draft' is safer
        effective_to: null, // Clear effective_to
        updated_by_user_id: userId,
        updated_at: new Date(),
      })
      .where(and(eq(rateTemplatesTable.id, templateId), eq(rateTemplatesTable.status, "archived"))) // Ensure it is archived
      .returning({ id: rateTemplatesTable.id });

    if (!updatedTemplate) {
      logger.warn(`Unarchive failed for rate template ID: ${templateId}, template not found or not archived.`);
      return false;
    }

    this.templateCache.delete(templateId);
    logger.debug(`Cache invalidated for template ${templateId} after unarchive.`);

    await this._logActivity(userId, "TEMPLATE_UNARCHIVED", templateId);
    return true;
  }

  // --- Placeholder Methods ---

  async calculateRateFromTemplate(
    templateId: number,
    calculationContext: any,
    userId?: number // Optional: if logging needs user context for calculation events
  ): Promise<CalculationResult | null> {
    const template = await this.getRateTemplateById(templateId);
    if (!template) {
      logger.error(
        `Rate template with ID: ${templateId} not found for calculation.`
      );
      return null;
    }

    const components = await this.getComponentsForTemplate(templateId);

    let current_rate = 0.0;
    const breakdown: CalculationComponentResult[] = [];
    const warnings: string[] = [];

    for (const component of components) {
      const componentBase = {
        component_id: component.id,
        component_name: component.component_name,
        component_type: component.component_type,
      };

      // Evaluate conditions
      let conditionsMet = true;
      let conditionEvalDetails = "Applied unconditionally";

      if (component.conditions && Object.keys(component.conditions).length > 0) {
        const evaluation = this._evaluateComponentConditions(
          component.conditions as ComponentConditions,
          calculationContext,
          warnings // Pass warnings array to log unsupported conditions
        );
        conditionsMet = evaluation.allMet;
        conditionEvalDetails = evaluation.details;
      }

      if (!conditionsMet) {
        breakdown.push({
          ...componentBase,
          value_applied: 0,
          details: `Skipped: Conditions not met (${conditionEvalDetails})`,
        });
        continue; // Skip to the next component
      }

      // Apply component logic if conditions are met
      switch (component.component_type) {
        case "base_fixed":
          const fixedValue = parseFloat(component.fixed_value_numeric as string || "0");
          current_rate += fixedValue;
          breakdown.push({
            ...componentBase,
            value_applied: fixedValue,
            details: "Fixed base rate",
          });
          break;

        case "allowance_fixed":
          const allowanceFixedValue = parseFloat(
            component.fixed_value_numeric as string || "0"
          );
          current_rate += allowanceFixedValue;
          breakdown.push({
            ...componentBase,
            value_applied: allowanceFixedValue,
            details: "Fixed allowance",
          });
          break;

        case "loading_percentage":
        case "allowance_percentage": // Handling both types similarly
          const percentageValue = parseFloat(component.percentage_value_numeric as string || "0");
          let base_value_for_percentage = 0;
          let baseDetail = "";

          if (component.based_on_component_id) {
            const referencedComponentResult = breakdown.find(
              (b) => b.component_id === component.based_on_component_id
            );
            if (referencedComponentResult) {
              base_value_for_percentage = referencedComponentResult.value_applied;
              baseDetail = `Component ID ${component.based_on_component_id} ('${referencedComponentResult.component_name || 'Unnamed'}')`;
            } else {
              warnings.push(
                `Referenced component ID ${component.based_on_component_id} for percentage calculation not found or not yet processed for component ID ${component.id}. Using 0 as base.`
              );
              baseDetail = `Referenced Component ID ${component.based_on_component_id} (Not Found)`;
            }
          } else {
            // If no specific component is referenced, use the current accumulated rate as the base
            base_value_for_percentage = current_rate;
            baseDetail = `subtotal $${current_rate.toFixed(2)}`;
          }

          const calculated_percentage_value = base_value_for_percentage * (percentageValue / 100.0);
          current_rate += calculated_percentage_value;

          breakdown.push({
            ...componentBase,
            value_applied: parseFloat(calculated_percentage_value.toFixed(2)),
            details: `${percentageValue}% of ${baseDetail}`,
          });
          break;

        case "base_award_classification":
          const awardCodeBase = component.value_source_table; // e.g., "MA000025"
          const classificationIdBase = component.value_identifier; // e.g., "123" (numeric FWA ID)

          if (!awardCodeBase || !classificationIdBase) {
            warnings.push(`Missing awardCode or classificationId for component ID: ${component.id} ('${component.component_name}')`);
            breakdown.push({ ...componentBase, value_applied: 0, details: "Configuration error: Missing award/classification identifiers" });
            break;
          }

          try {
            const effectiveDateStr = calculationContext.effectiveDate
                ? new Date(calculationContext.effectiveDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];

            // Assuming getPayRates can fetch a specific classification's rate
            // The API might return multiple rates; we need to find the most relevant one.
            // This might need a more specific method in FairWorkApiClient or more robust filtering here.
            const rates: PayRate[] = await this.fairWorkApiClient.getPayRates(awardCodeBase, {
              // classificationFixedId: parseInt(classificationIdBase, 10), // Ensure it's a number
              // For now, let's assume value_identifier is the classification *name* or *code* that needs to be found
              // And that getPayRates can filter by a textual classification description if not by ID
              // Or, we might need another API call to map classification name/code to FWA's classificationFixedId
              // This part is highly dependent on the actual API capabilities and data in component.value_identifier
              // For this step, let's assume value_identifier is a string that might be part of the rate description
              operativeFrom: effectiveDateStr,
              operativeTo: effectiveDateStr,
            });

            // Simplified: find first matching rate by a partial match on description or a specific field if available
            // This is a placeholder for more robust matching logic
            const targetClassificationIdNum = parseInt(classificationIdBase, 10);
            const foundRate = rates.find(r =>
                (r.classificationFixedId && r.classificationFixedId === targetClassificationIdNum) ||
                (r.classificationCode && r.classificationCode.toString() === classificationIdBase) || // If classificationIdBase is the code
                (r.classificationTitle && r.classificationTitle.includes(classificationIdBase)) // Fallback to title match
            );

            if (foundRate && foundRate.hourlyRate) {
              const awardRateValue = foundRate.hourlyRate;
              current_rate += awardRateValue;
              breakdown.push({
                ...componentBase,
                value_applied: awardRateValue,
                details: `Award base rate: ${awardCodeBase} - ${foundRate.classificationTitle || classificationIdBase} (${foundRate.employeeRateTypeCode || 'N/A'})`,
              });
            } else {
              warnings.push(`Failed to fetch or match award base rate for ${awardCodeBase} / ${classificationIdBase}. Full list had ${rates.length} items.`);
              breakdown.push({ ...componentBase, value_applied: 0, details: `Award rate not found for ${classificationIdBase}` });
            }
          } catch (error: any) {
            logger.error(`Error fetching award base rate for ${awardCodeBase} / ${classificationIdBase}:`, error);
            warnings.push(`API Error for award base rate ${awardCodeBase} / ${classificationIdBase}: ${error.message}`);
            breakdown.push({ ...componentBase, value_applied: 0, details: "API Error" });
          }
          break;

        case "allowance_award":
          const awardCodeAllowance = component.value_source_table; // e.g., "MA000025"
          const allowanceIdentifier = component.value_identifier; // e.g., "Tool Allowance" or specific ID/code

          if (!awardCodeAllowance || !allowanceIdentifier) {
            warnings.push(`Missing awardCode or allowanceIdentifier for component ID: ${component.id} ('${component.component_name}')`);
            breakdown.push({ ...componentBase, value_applied: 0, details: "Configuration error: Missing award/allowance identifiers" });
            break;
          }

          try {
            const effectiveDateStr = calculationContext.effectiveDate
              ? new Date(calculationContext.effectiveDate).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0];

            const allowances: Allowance[] = await this.fairWorkApiClient.getWageAllowances(awardCodeAllowance, {
              operativeFrom: effectiveDateStr,
              operativeTo: effectiveDateStr,
            });

            // Find the specific allowance - this depends on how allowanceIdentifier is stored.
            // It could be an ID, a name, or a code.
            const foundAllowance = allowances.find(
              (a) => (a.allowanceFixedId && a.allowanceFixedId.toString() === allowanceIdentifier) ||
                     (a.allowanceCode && a.allowanceCode === allowanceIdentifier) ||
                     a.description.toLowerCase().includes(allowanceIdentifier.toLowerCase())
            );

            if (foundAllowance && typeof foundAllowance.amount === 'number') {
              // Determine if allowance is taxable (this is an assumption, API should confirm)
              // const isTaxable = foundAllowance.isTaxable !== undefined ? foundAllowance.isTaxable : true; // Default to taxable
              // For now, just add amount. Taxability could be a property of the component or fetched.
              const allowanceValue = foundAllowance.amount;
              current_rate += allowanceValue;
              breakdown.push({
                ...componentBase,
                value_applied: allowanceValue,
                details: `Award allowance: ${awardCodeAllowance} - ${foundAllowance.description} (${foundAllowance.allowanceTypeDescription || foundAllowance.paymentType || ''})`,
              });
            } else {
              warnings.push(`Failed to fetch or match award allowance for ${awardCodeAllowance} / ${allowanceIdentifier}. Found ${allowances.length} total allowances.`);
              breakdown.push({ ...componentBase, value_applied: 0, details: `Award allowance not found for ${allowanceIdentifier}` });
            }
          } catch (error: any) {
            logger.error(`Error fetching award allowance for ${awardCodeAllowance} / ${allowanceIdentifier}:`, error);
            warnings.push(`API Error for award allowance ${awardCodeAllowance} / ${allowanceIdentifier}: ${error.message}`);
            breakdown.push({ ...componentBase, value_applied: 0, details: "API Error" });
          }
          break;

        default:
          warnings.push(
            `Component type '${component.component_type}' (ID: ${component.id}, Name: '${component.component_name}') not yet supported.`
          );
          breakdown.push({
            ...componentBase,
            value_applied: 0,
            details: "Unsupported component type",
          });
          break;
      }
    }

    const result: CalculationResult = {
      template_id: templateId,
      final_rate: parseFloat(current_rate.toFixed(2)),
      breakdown: breakdown,
      warnings: warnings,
      calculation_context: calculationContext,
    };

    if (userId) {
        await this._logActivity(
          userId,
          "RATE_CALCULATED_DEBUG",
          templateId,
          { context: calculationContext, result: result },
          "rate_template",
          templateId
        );
    } else {
        logger.info(`Rate calculation performed for template ${templateId} (no user context for logging)`, { context: calculationContext, result: result });
    }


    return result;
  }

  private _evaluateComponentConditions(
    conditions: ComponentConditions,
    context: any,
    warnings: string[]
  ): { allMet: boolean; details: string } {
    let allMet = true;
    const unmetDetails: string[] = [];

    for (const key in conditions) {
      const conditionValue = conditions[key as keyof ComponentConditions];
      const contextValue = context[key];

      if (conditionValue === undefined || conditionValue === null) continue; // Skip if condition value is not set

      let conditionPass = false;
      switch (key as keyof ComponentConditions) {
        case "day_of_week":
          if (Array.isArray(conditionValue)) {
            conditionPass = conditionValue.includes(contextValue as string);
          } else {
            conditionPass = conditionValue === contextValue;
          }
          if (!conditionPass) unmetDetails.push(`${key}: is ${contextValue}, expected ${conditionValue}`);
          break;
        case "min_age":
          conditionPass = typeof contextValue === 'number' && contextValue >= (conditionValue as number);
          if (!conditionPass) unmetDetails.push(`${key}: is ${contextValue}, expected >= ${conditionValue}`);
          break;
        case "max_age":
          conditionPass = typeof contextValue === 'number' && contextValue <= (conditionValue as number);
          if (!conditionPass) unmetDetails.push(`${key}: is ${contextValue}, expected <= ${conditionValue}`);
          break;
        case "min_hours_in_shift":
            conditionPass = typeof contextValue === 'number' && contextValue >= (conditionValue as number);
            if (!conditionPass) unmetDetails.push(`${key}: is ${contextValue}, expected >= ${conditionValue}`);
            break;
        case "max_hours_in_shift":
            conditionPass = typeof contextValue === 'number' && contextValue <= (conditionValue as number);
            if (!conditionPass) unmetDetails.push(`${key}: is ${contextValue}, expected <= ${conditionValue}`);
            break;
        case "is_public_holiday":
          conditionPass = conditionValue === contextValue;
          if (!conditionPass) unmetDetails.push(`${key}: is ${contextValue}, expected ${conditionValue}`);
          break;
        case "time_of_day_between":
          if (
            Array.isArray(conditionValue) &&
            conditionValue.length === 2 &&
            typeof contextValue === "string"
          ) {
            const [from, to] = conditionValue as [string, string];
            // Simple string comparison HH:MM, assumes contextValue is also HH:MM
            // This handles crossing midnight if "from" is greater than "to" (e.g., 18:00 to 06:00)
            if (from > to) { // Overnight condition
              conditionPass = contextValue >= from || contextValue < to;
            } else { // Same day condition
              conditionPass = contextValue >= from && contextValue < to;
            }
            if (!conditionPass) unmetDetails.push(`time ${contextValue} not between ${from}-${to}`);
          } else {
            conditionPass = false; // Invalid format for time_of_day_between
            unmetDetails.push(`Invalid time_of_day_between format`);
          }
          break;
        default:
          warnings.push(`Unsupported condition type: ${key}`);
          conditionPass = true; // Default to true for unsupported conditions to not block application, but log it
          break;
      }
      if (!conditionPass) {
        allMet = false;
      }
    }
    return { allMet, details: allMet ? "All conditions met" : unmetDetails.join("; ") };
  }


  async validateTemplateRate(
    templateId: number,
    validationContext: any, // Expects { awardCode, classificationSystemIdentifier, effectiveDate, userId? }
    // userId is for logging, can be part of validationContext
  ): Promise<ValidationResult | null> {
    const warnings: string[] = [];
    const {
        awardCode,
        classificationSystemIdentifier, // Assuming this is FWA's classificationFixedId
        effectiveDate,
        userId // Optional, for logging
    } = validationContext;

    if (!awardCode || !classificationSystemIdentifier || !effectiveDate) {
      logger.error("Validation context missing required fields (awardCode, classificationSystemIdentifier, effectiveDate).", validationContext);
      // Cannot return a meaningful ValidationResult structure if these are missing, so return null or throw.
      // For now, returning null as per signature, but an error in ValidationResult might be better.
      // Or, change signature to always return ValidationResult and populate warnings.
      return null;
    }

    const effectiveDateStr = new Date(effectiveDate).toISOString().split('T')[0];
    let templateRateData: CalculationResult | null = null;
    let template_rate: number | null = null;

    try {
      templateRateData = await this.calculateRateFromTemplate(
        templateId,
        validationContext, // Pass the full context for calculation consistency
        userId
      );
      if (templateRateData && typeof templateRateData.final_rate === 'number') {
        template_rate = templateRateData.final_rate;
        warnings.push(...templateRateData.warnings); // Collect warnings from calculation
      } else {
        warnings.push("Could not calculate template rate or final_rate is missing.");
      }
    } catch (error: any) {
        logger.error(`Error during calculateRateFromTemplate for template ${templateId} in validation:`, error);
        warnings.push(`Error calculating template rate: ${error.message}`);
    }


    let official_minimum_rate: number | null = null;
    try {
      // Assuming classificationSystemIdentifier is the FWA classificationFixedId (numeric)
      const classificationFixedId = parseInt(classificationSystemIdentifier, 10);
      if (isNaN(classificationFixedId)) {
          warnings.push(`Invalid classificationSystemIdentifier: '${classificationSystemIdentifier}' is not a number.`);
      } else {
        const rates: PayRate[] = await this.fairWorkApiClient.getPayRates(awardCode, {
          classificationFixedId: classificationFixedId,
          operativeFrom: effectiveDateStr,
          operativeTo: effectiveDateStr,
          // We might need to specify EmployeeRateTypeCode if there are multiple (e.g., adult, junior)
          // For now, assume the primary adult rate is desired or API handles it.
        });

        // Find the most relevant rate. Often there's only one for such specific query.
        // If multiple, might need more logic (e.g. find 'Adult' if not specified)
        if (rates.length > 0) {
            // Prefer rates with an explicit 'Adult' type if multiple exist, or just take the first.
            // This is a simplification; real scenarios might need more nuanced selection.
            const adultRate = rates.find(r => r.employeeRateTypeCode === 'Adult');
            official_minimum_rate = adultRate ? adultRate.hourlyRate : rates[0].hourlyRate;
            if (rates.length > 1 && !adultRate) {
                warnings.push(`Multiple rates found for classification ${classificationSystemIdentifier}, selected first one. Specify EmployeeRateTypeCode if needed.`);
            }
        } else {
          warnings.push(
            `No official minimum rate found for Award ${awardCode}, Classification ID ${classificationSystemIdentifier} on ${effectiveDateStr}.`
          );
        }
      }
    } catch (error: any) {
      logger.error(`Error fetching official award rate for ${awardCode} / ${classificationSystemIdentifier}:`, error);
      warnings.push(
        `API Error fetching official rate for ${awardCode} / ${classificationSystemIdentifier}: ${error.message}`
      );
    }

    let is_compliant = false;
    let difference: number | null = null;

    if (template_rate !== null && official_minimum_rate !== null) {
      difference = parseFloat((template_rate - official_minimum_rate).toFixed(2));
      is_compliant = difference >= 0;
    } else {
      warnings.push("Compliance could not be determined as one or both rates are unavailable.");
    }

    const awardDetailsStr = `${awardCode} - Classification ${classificationSystemIdentifier}`;

    const result: ValidationResult = {
      template_id: templateId,
      is_compliant: is_compliant,
      template_rate: template_rate,
      official_minimum_rate: official_minimum_rate,
      difference: difference,
      award_details: awardDetailsStr,
      effective_date: effectiveDateStr,
      warnings: warnings,
      validation_context: validationContext
    };

    await this._logActivity(
      userId || 0, // Default to 0 if no user ID in context, or handle differently
      "RATE_VALIDATION_PERFORMED",
      templateId,
      { context: validationContext, result: result }, // Log both context and result
      "rate_template",
      templateId
    );

    return result;
  }

  // --- Rate Template Component CRUD Methods ---

  async addComponentToTemplate(
    templateId: number,
    componentData: Omit<RateTemplateComponentData, "rate_template_id">, // rate_template_id will be set from templateId
    userId: number
  ): Promise<RateTemplateComponent> {

    const dataToInsert: RateTemplateComponentData = {
        ...componentData,
        rate_template_id: templateId, // Ensure correct template ID
    };

    // Convert decimal fields to string if they are numbers
    if (typeof dataToInsert.fixed_value_numeric === 'number') {
        dataToInsert.fixed_value_numeric = dataToInsert.fixed_value_numeric.toString();
    }
    if (typeof dataToInsert.percentage_value_numeric === 'number') {
        dataToInsert.percentage_value_numeric = dataToInsert.percentage_value_numeric.toString();
    }

    const [newComponent] = await db
      .insert(rateTemplateComponentsTable)
      .values({
        ...dataToInsert,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    if (!newComponent) {
      logger.error(
        `Failed to add component to template ID: ${templateId}`,
        componentData
      );
      throw new Error("Failed to add component to rate template.");
    }

    await this._logActivity(
      userId,
      "TEMPLATE_COMPONENT_ADDED",
      templateId,
      {
        component_id: newComponent.id,
        component_name: newComponent.component_name,
      },
      "rate_template_component",
      newComponent.id
    );

    // Also update the parent template's updated_at timestamp and version
    await this.updateRateTemplateTimestamp(templateId, userId, true);
    // Invalidate parent template cache as its effective state (due to new component versioning it) has changed
    this.templateCache.delete(templateId);
    logger.debug(`Cache invalidated for template ${templateId} after adding component.`);


    return newComponent as RateTemplateComponent;
  }

  async updateTemplateComponent(
    componentId: number,
    componentData: Partial<Omit<RateTemplateComponentData, "rate_template_id">>, // rate_template_id should not be changed here
    userId: number
  ): Promise<RateTemplateComponent | null> {

    const dataToUpdate = { ...componentData };
    // Convert decimal fields to string if they are numbers
    if (typeof dataToUpdate.fixed_value_numeric === 'number') {
        dataToUpdate.fixed_value_numeric = dataToUpdate.fixed_value_numeric.toString();
    }
    if (typeof dataToUpdate.percentage_value_numeric === 'number') {
        dataToUpdate.percentage_value_numeric = dataToUpdate.percentage_value_numeric.toString();
    }

    const [updatedComponent] = await db
      .update(rateTemplateComponentsTable)
      .set({
        ...dataToUpdate,
        updated_at: new Date(),
      })
      .where(eq(rateTemplateComponentsTable.id, componentId))
      .returning();

    if (!updatedComponent) {
      logger.warn(
        `Update failed for template component ID: ${componentId} by user ID: ${userId}`
      );
      return null;
    }

    // Log activity, also update parent template's timestamp
    // Need to fetch templateId for logging and for updating parent
    const parentTemplateId = updatedComponent.rate_template_id;

    await this._logActivity(
      userId,
      "TEMPLATE_COMPONENT_UPDATED",
      parentTemplateId,
      {
        component_id: componentId,
        updated_fields: Object.keys(componentData),
      },
      "rate_template_component",
      componentId
    );

    if (parentTemplateId) {
        await this.updateRateTemplateTimestamp(parentTemplateId, userId, false); // Don't increment version for component change
        // Invalidate parent template cache as its components list has changed
        this.templateCache.delete(parentTemplateId);
        logger.debug(`Cache invalidated for template ${parentTemplateId} after updating component.`);
    }


    return updatedComponent as RateTemplateComponent;
  }

  async removeTemplateComponent(
    componentId: number,
    userId: number
  ): Promise<boolean> {
    // Fetch component to get templateId for logging and updating parent
    const component = await db.select({ rate_template_id: rateTemplateComponentsTable.rate_template_id })
        .from(rateTemplateComponentsTable)
        .where(eq(rateTemplateComponentsTable.id, componentId))
        .limit(1);

    const parentTemplateId = component.length > 0 ? component[0].rate_template_id : undefined;

    const [deletedComponent] = await db
      .delete(rateTemplateComponentsTable)
      .where(eq(rateTemplateComponentsTable.id, componentId))
      .returning({ id: rateTemplateComponentsTable.id });

    if (!deletedComponent) {
      logger.warn(
        `Remove failed for template component ID: ${componentId}, component not found.`
      );
      return false;
    }

    await this._logActivity(
      userId,
      "TEMPLATE_COMPONENT_REMOVED",
      parentTemplateId, // Log with parent template ID if available
      { component_id: componentId },
      "rate_template_component",
      componentId
    );

    if (parentTemplateId) {
      await this.updateRateTemplateTimestamp(parentTemplateId, userId, false); // Don't increment version for component change
      // Invalidate parent template cache as its components list has changed
      this.templateCache.delete(parentTemplateId);
      logger.debug(`Cache invalidated for template ${parentTemplateId} after removing component.`);
    }

    return true;
  }

  async getComponentsForTemplate(
    templateId: number
  ): Promise<RateTemplateComponent[]> {
    return (await db
      .select()
      .from(rateTemplateComponentsTable)
      .where(eq(rateTemplateComponentsTable.rate_template_id, templateId))
      .orderBy(
        asc(rateTemplateComponentsTable.order),
        asc(rateTemplateComponentsTable.id)
      )) as RateTemplateComponent[];
  }

  // Helper to update template's updated_at and optionally version
  private async updateRateTemplateTimestamp(templateId: number, userId: number, incrementVersion: boolean = false): Promise<void> {
    const currentTemplate = await this.getRateTemplateById(templateId);
    if (!currentTemplate) return;

    const updateData: Partial<RateTemplate> = {
        updated_at: new Date(),
        updated_by_user_id: userId,
    };

    if (incrementVersion) {
        updateData.version = (currentTemplate.version || 0) + 1;
    }

    await db.update(rateTemplatesTable)
        .set(updateData)
        .where(eq(rateTemplatesTable.id, templateId));
  }

}

// Export an instance of the service
export const rateTemplateService = new RateTemplateService();

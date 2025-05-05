interface RateComponent {
  name: string;
  rate: number;
  type: 'base' | 'loading' | 'allowance' | 'penalty';
  description?: string;
}

interface RateCalculation {
  baseRate: number;
  components: RateComponent[];
  total: number;
  breakdown: {
    wages: number;
    loadings: number;
    allowances: number;
    penalties: number;
    total: number;
  };
}

export class RatesCalculator {
  private readonly MARKUP_PERCENTAGE = 25; // Default markup
  private readonly WORKERS_COMP_RATE = 0.05; // 5% for workers compensation
  private readonly PAYROLL_TAX_RATE = 0.0485; // 4.85% payroll tax
  private readonly SUPER_RATE = 0.11; // 11% superannuation

  calculateChargeRate(baseRate: number, components: RateComponent[]): RateCalculation {
    const calculation = this.calculateTotalRate(baseRate, components);
    const totalCost = this.calculateTotalCost(calculation.total);
    const chargeRate = this.applyMarkup(totalCost);

    return {
      ...calculation,
      total: chargeRate,
    };
  }

  private calculateTotalRate(baseRate: number, components: RateComponent[]): RateCalculation {
    let loadings = 0;
    let allowances = 0;
    let penalties = 0;

    components.forEach((component) => {
      const amount = baseRate * component.rate;

      switch (component.type) {
        case 'loading':
          loadings += amount;
          break;
        case 'allowance':
          allowances += amount;
          break;
        case 'penalty':
          penalties += amount;
          break;
      }
    });

    const total = baseRate + loadings + allowances + penalties;

    return {
      baseRate,
      components,
      total,
      breakdown: {
        wages: baseRate,
        loadings,
        allowances,
        penalties,
        total,
      },
    };
  }

  private calculateTotalCost(rate: number): number {
    const superAmount = rate * this.SUPER_RATE;
    const workersComp = rate * this.WORKERS_COMP_RATE;
    const payrollTax = rate * this.PAYROLL_TAX_RATE;

    return rate + superAmount + workersComp + payrollTax;
  }

  private applyMarkup(cost: number): number {
    return cost * (1 + this.MARKUP_PERCENTAGE / 100);
  }

  generateQuote(calculation: RateCalculation): { summary: { baseRate: number; totalRate: number; weeklyRate: number; annualRate: number; }; breakdown: { wages: number; loadings: number; allowances: number; penalties: number; superannuation: number; workersComp: number; payrollTax: number; markup: number; }; components: { amount: number; name: string; rate: number; type: "base" | "loading" | "allowance" | "penalty"; description?: string | undefined; }[]; } {
    return {
      summary: {
        baseRate: calculation.baseRate,
        totalRate: calculation.total,
        weeklyRate: calculation.total * 38, // Standard week
        annualRate: calculation.total * 38 * 52, // Annual salary
      },
      breakdown: {
        wages: calculation.breakdown.wages,
        loadings: calculation.breakdown.loadings,
        allowances: calculation.breakdown.allowances,
        penalties: calculation.breakdown.penalties,
        superannuation: calculation.breakdown.total * this.SUPER_RATE,
        workersComp: calculation.breakdown.total * this.WORKERS_COMP_RATE,
        payrollTax: calculation.breakdown.total * this.PAYROLL_TAX_RATE,
        markup: calculation.total - calculation.breakdown.total,
      },
      components: calculation.components.map((component) => ({
        ...component,
        amount: calculation.baseRate * component.rate,
      })),
    };
  }
}

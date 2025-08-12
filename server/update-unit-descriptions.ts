/**
 * Script to update generic unit descriptions with more detailed information
 */
import { unitsOfCompetency } from '@shared/schema';
import { eq, like } from 'drizzle-orm';
import { db } from './db';

export async function updateUnitDescriptions() {
  try {
    console.log('Starting unit description updates...');

    // Find all units with the generic description
    const unitsToUpdate = await db
      .select()
      .from(unitsOfCompetency)
      .where(like(unitsOfCompetency.unitDescription, '%Imported from Training.gov.au%'));

    console.log(`Found ${unitsToUpdate.length} units with generic descriptions to update`);

    // Unit description map - maps unit codes to proper descriptions
    const descriptionMap: Record<string, string> = {
      CPCCBC4001:
        'This unit describes the skills and knowledge required to access, interpret and apply relevant building codes and standards applicable to building surveying. It includes the analysis and application of the National Construction Code (NCC) and other codes and standards related to the design and construction of buildings.',
      CPCCBC4002:
        'This unit describes the skills and knowledge required to apply work health and safety (WHS) requirements, policies and procedures in the building and construction workplace. It covers identifying and managing hazards and risks, implementing WHS communication and reporting processes, and contributing to WHS compliance.',
      CPCCBC4003:
        'This unit describes the skills and knowledge required to select and prepare appropriate construction contracts, including the sections, clauses and conditions for domestic building projects. It addresses interpreting contract requirements and selecting suitable contracts.',
      CPCCBC4004:
        'This unit describes the skills and knowledge required to identify and produce estimated costs for building work. It includes establishing the estimated costs of building and construction projects and documenting the process.',
      CPCCBC4005:
        'This unit describes the skills and knowledge required to produce building plans for residential structures that are compliant with relevant building codes and standards. It includes planning and preparing for drafting, developing the set of drafting requirements, preparing drawings, and finalizing the drafting application process.',
      CPCCBC4008:
        'This unit describes the skills and knowledge required to conduct on-site supervision of building projects. It includes establishing and implementing effective site management processes, overseeing on-site operations, and managing site personnel.',
      CPCCBC4010:
        'This unit describes the skills and knowledge required to apply structural principles to the construction of residential and commercial structures. It includes understanding structural requirements on building components, analyzing structural systems, and applying principles to construction.',
      CPCCBC4012:
        'This unit describes the skills and knowledge required to read, interpret, and apply approved plans, specifications, and codes to residential and commercial buildings. It includes interpreting documentation for planning and supervision of the construction process.',
      CPCCBC4053:
        'This unit describes the skills and knowledge required to apply for and maintain registration in the building and construction industry. It includes understanding regulatory requirements, preparing registration applications, and maintaining professional standards.',
      CPCCCA2002:
        'This unit describes the skills and knowledge required to select and use hand and power tools in building and construction work. It includes identifying, selecting, and using hand and power tools in a variety of applications.',
      CPCCCM2006:
        'This unit describes the skills and knowledge required to apply basic leveling procedures using equipment such as spirit levels, automatic and laser levels to establish accurate and consistent heights and levels for construction projects.',
    };

    // Update units with specific descriptions
    let updatedCount = 0;
    for (const unit of unitsToUpdate) {
      if (unit.unitCode in descriptionMap) {
        await db
          .update(unitsOfCompetency)
          .set({
            unitDescription: descriptionMap[unit.unitCode],
            updatedAt: new Date(),
          })
          .where(eq(unitsOfCompetency.id, unit.id));

        updatedCount++;
        console.log(`Updated description for ${unit.unitCode} - ${unit.unitTitle}`);
      }
    }

    console.log(`Successfully updated ${updatedCount} unit descriptions`);
    return updatedCount;
  } catch (error) {
    console.error('Error updating unit descriptions:', error);
    throw error;
  }
}

// Run the script
try {
  const count = await updateUnitDescriptions();
  console.log(`Updated ${count} unit descriptions`);
  process.exit(0);
} catch (error) {
  console.error('Script failed:', error);
  process.exit(1);
}
